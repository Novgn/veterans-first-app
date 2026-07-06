/**
 * Stripe webhook handler (Story 5.5).
 *
 * Authenticates every request against STRIPE_WEBHOOK_SECRET before touching
 * the database, then dispatches `payment_intent.succeeded` / `.payment_failed`
 * to the payments table idempotently on `stripe_payment_intent_id`.
 *
 * The Stripe SDK is not installed yet, so signature verification is done
 * inline against Stripe's documented scheme (HMAC-SHA256 over `${t}.${payload}`
 * with a 5-minute replay window). This closes the "anyone who finds the URL can
 * mark invoices paid" hole without a new dependency. When the Stripe SDK lands,
 * swap `verifyStripeSignature` for `stripe.webhooks.constructEvent` (same
 * secret). The route FAILS CLOSED: with no secret configured it returns 503
 * rather than accept unsigned JSON.
 */

import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

// Verify the `Stripe-Signature` header against the raw request body per
// https://stripe.com/docs/webhooks#verify-manually. Constant-time compare and
// a 5-minute timestamp tolerance guard against forgery and replay.
function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = header.split(',').map((p) => p.split('='));
  const timestamp = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts
    .filter(([k]) => k === 'v1')
    .map(([, v]) => v)
    .filter((v): v is string => Boolean(v));
  if (!timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`, 'utf8')
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'utf8');

  return signatures.some((sig) => {
    const sigBuf = Buffer.from(sig, 'utf8');
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}

function parseEvent(body: unknown): StripeEvent | null {
  if (!body || typeof body !== 'object') return null;
  const obj = body as Record<string, unknown>;
  if (typeof obj.id !== 'string' || typeof obj.type !== 'string') return null;
  const data = obj.data as Record<string, unknown> | undefined;
  if (!data || typeof data.object !== 'object' || data.object == null) return null;
  return {
    id: obj.id,
    type: obj.type,
    data: { object: data.object as Record<string, unknown> },
  };
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed: without the signing secret we cannot authenticate Stripe,
    // so the payment-mutation path stays disabled rather than trusting input.
    log.error({ event: 'stripe.webhook.unconfigured' }, 'STRIPE_WEBHOOK_SECRET unset; rejecting');
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }

  // Read the RAW body — signature verification must run over the exact bytes.
  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get('stripe-signature'), secret)) {
    log.warn({ event: 'stripe.webhook.bad_signature' }, 'rejected unsigned/invalid webhook');
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const event = parseEvent(json);
  if (!event) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const supabase = getServiceRoleSupabase();
  const obj = event.data.object;
  const paymentIntentId = typeof obj.id === 'string' ? obj.id : null;
  if (!paymentIntentId) return NextResponse.json({ error: 'missing-pi' }, { status: 400 });

  if (event.type === 'payment_intent.succeeded') {
    const { data: payment } = await supabase
      .from('payments')
      .select('id, invoice_id, status')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    const row = payment as { id: string; invoice_id: string; status: string } | null;
    if (!row || row.status === 'succeeded') {
      return NextResponse.json({ ok: true, noop: true });
    }
    await supabase
      .from('payments')
      .update({ status: 'succeeded', updated_at: new Date().toISOString() })
      .eq('id', row.id);
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', row.invoice_id);
    log.info({ event: 'stripe.webhook.succeeded' }, 'marked paid');
    return NextResponse.json({ ok: true });
  }

  if (event.type === 'payment_intent.payment_failed') {
    const failureReason =
      typeof obj.last_payment_error === 'object' && obj.last_payment_error !== null
        ? (((obj.last_payment_error as Record<string, unknown>).message as string | undefined) ??
          'declined')
        : 'declined';
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: failureReason.slice(0, 200),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId);
    log.info({ event: 'stripe.webhook.failed' }, 'marked failed');
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: event.type });
}
