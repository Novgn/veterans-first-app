import 'server-only';

/**
 * Invoice charging (Story 5.5).
 *
 * Stubs the real Stripe SDK — actual Stripe wiring needs live keys and
 * webhook setup, which is tracked in deferred findings. The rest of the
 * flow (validation, payments row, audit log) is the production shape.
 */

import { buildChargeInput, type ChargeInput } from '@veterans-first/shared/utils';

import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

interface StripeCharge {
  id: string;
  paymentMethodType: string | null;
}

async function stubbedStripeCharge(charge: ChargeInput): Promise<StripeCharge> {
  // TODO: replace with `stripe.paymentIntents.create({ customer, amount,
  // confirm: true, payment_method, off_session: true })`. Logging keeps
  // numeric shape only to avoid log forging.
  log.info(
    {
      event: 'billing.charge.stub',
      amountLen: charge.amountCents.toString().length,
      customerLen: charge.stripeCustomerId.length,
    },
    'stub stripe charge',
  );
  return {
    id: `pi_stub_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    paymentMethodType: 'card',
  };
}

export interface ChargeResult {
  status: 'succeeded' | 'skipped' | 'failed';
  reason?: string;
  paymentId?: string;
}

export async function chargePendingInvoice(invoiceId: string): Promise<ChargeResult> {
  const supabase = getServiceRoleSupabase();

  const invoiceRes = await supabase
    .from('invoices')
    .select('id, rider_id, total_cents, status, billing_period')
    .eq('id', invoiceId)
    .maybeSingle();

  const invoiceRow = invoiceRes.data as {
    id: string;
    rider_id: string;
    total_cents: number;
    status: string;
    billing_period: string;
  } | null;

  if (!invoiceRow) return { status: 'skipped', reason: 'invoice-not-found' };

  const accountRes = await supabase
    .from('rider_payment_accounts')
    .select('stripe_customer_id, default_payment_method_id, autopay_enabled, credit_balance_cents')
    .eq('rider_id', invoiceRow.rider_id)
    .maybeSingle();

  const accountRow = accountRes.data as {
    stripe_customer_id: string | null;
    default_payment_method_id: string | null;
    autopay_enabled: boolean;
    credit_balance_cents: number;
  } | null;

  const decision = buildChargeInput(
    {
      id: invoiceRow.id,
      riderId: invoiceRow.rider_id,
      totalCents: invoiceRow.total_cents,
      status: invoiceRow.status,
      billingPeriod: invoiceRow.billing_period,
    },
    {
      stripeCustomerId: accountRow?.stripe_customer_id ?? null,
      defaultPaymentMethodId: accountRow?.default_payment_method_id ?? null,
      autopayEnabled: accountRow?.autopay_enabled ?? false,
      creditBalanceCents: accountRow?.credit_balance_cents ?? 0,
    },
  );

  if (!decision.ok) {
    log.info({ event: 'billing.charge.skip', reason: decision.reason }, 'charge skipped');
    return { status: 'skipped', reason: decision.reason };
  }

  const pendingRow = await supabase
    .from('payments')
    .insert({
      invoice_id: decision.charge.invoiceId,
      rider_id: decision.charge.riderId,
      amount_cents: decision.charge.amountCents,
      stripe_customer_id: decision.charge.stripeCustomerId,
      status: 'pending',
    })
    .select('id')
    .single();

  if (pendingRow.error || !pendingRow.data) {
    log.error({ event: 'billing.charge.pendingInsertFail' }, 'insert failed');
    return { status: 'failed', reason: 'insert-failed' };
  }

  const paymentId = (pendingRow.data as { id: string }).id;

  try {
    const stripeResult = await stubbedStripeCharge(decision.charge);
    await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: stripeResult.id,
        payment_method_type: stripeResult.paymentMethodType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', invoiceId);

    await supabase.from('audit_logs').insert({
      user_id: null,
      action: 'invoice_paid',
      resource_type: 'invoices',
      resource_id: invoiceId,
      new_values: { paymentId, amountCents: decision.charge.amountCents },
    });

    return { status: 'succeeded', paymentId };
  } catch (err) {
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: (err as Error).message.slice(0, 200),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    await supabase.from('audit_logs').insert({
      user_id: null,
      action: 'invoice_payment_failed',
      resource_type: 'invoices',
      resource_id: invoiceId,
      new_values: { paymentId },
    });

    return { status: 'failed', reason: 'stripe-error', paymentId };
  }
}
