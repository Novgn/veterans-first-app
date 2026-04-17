/**
 * Stripe webhook handler (Story 5.5).
 *
 * Verifies the signature with STRIPE_WEBHOOK_SECRET, then dispatches
 * `payment_intent.succeeded` / `.payment_failed` to the payments table
 * idempotently on `stripe_payment_intent_id`.
 *
 * The actual Stripe SDK is not wired into this batch — see the Story 5.5
 * dev notes. This handler assumes a JSON body matching the Stripe event
 * shape so we can validate + test the downstream effect without the
 * live client. When Stripe integration lands, swap `parseEvent` for
 * `stripe.webhooks.constructEvent`.
 */

import { NextResponse } from 'next/server';

import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
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
  const json = (await req.json().catch(() => null)) as unknown;
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
