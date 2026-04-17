import 'server-only';

/**
 * Invoice generator (Story 5.4).
 *
 * Given a completed ride id, writes an invoice row (idempotent on
 * ride_id for per_ride invoices). Caller is responsible for authz —
 * this module will be called from the completion flow and from a
 * future sweep job.
 */

import {
  buildInvoiceNumber,
  computeDueDate,
  computeInvoiceTotals,
} from '@veterans-first/shared/utils';

import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export interface GenerateInvoiceResult {
  invoiceId: string;
  invoiceNumber: string;
  status: 'created' | 'existing' | 'skipped';
}

export async function generateInvoiceForRide(
  rideId: string,
): Promise<GenerateInvoiceResult | null> {
  const supabase = getServiceRoleSupabase();

  const { data: rideRow } = await supabase
    .from('rides')
    .select('id, rider_id, fare_cents, completed_at, status')
    .eq('id', rideId)
    .maybeSingle();

  const ride = rideRow as {
    id: string;
    rider_id: string;
    fare_cents: number | null;
    completed_at: string | null;
    status: string;
  } | null;

  if (!ride) return null;
  if (ride.status !== 'completed' || ride.fare_cents == null) {
    log.info(
      { event: 'billing.invoice.skip', reason: 'not-completed-or-no-fare' },
      'skipped invoice generation',
    );
    return { invoiceId: '', invoiceNumber: '', status: 'skipped' };
  }

  const existing = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('ride_id', rideId)
    .eq('billing_period', 'per_ride')
    .maybeSingle();

  if (existing.data) {
    const row = existing.data as { id: string; invoice_number: string };
    return { invoiceId: row.id, invoiceNumber: row.invoice_number, status: 'existing' };
  }

  const completedAt = ride.completed_at ? new Date(ride.completed_at) : new Date();
  const totals = computeInvoiceTotals(ride.fare_cents);
  const dueDate = computeDueDate(completedAt);

  // Count invoices generated today (service-role bypasses RLS so this
  // count is global, not user-scoped).
  const dayStart = new Date(
    Date.UTC(
      completedAt.getUTCFullYear(),
      completedAt.getUTCMonth(),
      completedAt.getUTCDate(),
      0,
      0,
      0,
    ),
  );
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const countRes = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', dayStart.toISOString())
    .lt('created_at', dayEnd.toISOString());
  const sequence = (countRes.count ?? 0) + 1;

  const invoiceNumber = buildInvoiceNumber(completedAt, sequence);

  const { data: inserted, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      rider_id: ride.rider_id,
      ride_id: ride.id,
      amount_cents: totals.amountCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      status: 'pending',
      billing_period: 'per_ride',
      due_date: dueDate,
    })
    .select('id, invoice_number')
    .single();

  if (error || !inserted) {
    log.warn({ event: 'billing.invoice.insertFail' }, 'insert failed, retrying lookup');
    const recheck = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('ride_id', rideId)
      .eq('billing_period', 'per_ride')
      .maybeSingle();
    if (recheck.data) {
      const row = recheck.data as { id: string; invoice_number: string };
      return { invoiceId: row.id, invoiceNumber: row.invoice_number, status: 'existing' };
    }
    return null;
  }

  const row = inserted as { id: string; invoice_number: string };

  await supabase.from('invoice_line_items').insert({
    invoice_id: row.id,
    ride_id: ride.id,
    description: `Ride fare (${ride.id.slice(0, 8)})`,
    amount_cents: ride.fare_cents,
  });

  await supabase.from('audit_logs').insert({
    user_id: null,
    action: 'invoice_generated',
    resource_type: 'invoices',
    resource_id: row.id,
    new_values: { rideId, totalCents: totals.totalCents },
  });

  return { invoiceId: row.id, invoiceNumber: row.invoice_number, status: 'created' };
}
