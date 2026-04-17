import 'server-only';

/**
 * Consolidated invoice runner (Story 5.6).
 *
 * Collects a rider's completed, uninvoiced rides across a billing
 * period and writes a single invoice + one line item per ride.
 * Idempotent via the partial unique index on
 * (rider_id, billing_period, period_start, period_end).
 */

import {
  billingPeriodToTimestampRange,
  buildInvoiceNumber,
  computeDueDate,
  computeInvoiceTotals,
  previousBillingPeriod,
  type BillingFrequency,
  type BillingPeriod,
} from '@veterans-first/shared/utils';

import { chargePendingInvoice } from '@/lib/billing/charging';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export interface ConsolidationResult {
  riderId: string;
  status: 'created' | 'existing' | 'empty';
  invoiceId?: string;
  rideCount: number;
}

interface RidePeriodRow {
  id: string;
  fare_cents: number;
  completed_at: string | null;
}

export async function consolidateInvoicesForRider(
  riderId: string,
  frequency: BillingFrequency,
  referenceDate: Date = new Date(),
): Promise<ConsolidationResult> {
  const supabase = getServiceRoleSupabase();

  const period = previousBillingPeriod(frequency, referenceDate);

  const existing = await supabase
    .from('invoices')
    .select('id')
    .eq('rider_id', riderId)
    .eq('billing_period', frequency)
    .eq('period_start', period.startIso)
    .eq('period_end', period.endIso)
    .maybeSingle();

  if (existing.data) {
    return {
      riderId,
      status: 'existing',
      invoiceId: (existing.data as { id: string }).id,
      rideCount: 0,
    };
  }

  const rides = await fetchUninvoicedRides(riderId, period);
  if (rides.length === 0) {
    return { riderId, status: 'empty', rideCount: 0 };
  }

  const subtotal = rides.reduce((acc, r) => acc + r.fare_cents, 0);
  const totals = computeInvoiceTotals(subtotal);
  const dueDate = computeDueDate(referenceDate);
  const invoiceNumber = await nextInvoiceNumber(supabase, referenceDate);

  const { data: inserted, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      rider_id: riderId,
      ride_id: null,
      amount_cents: totals.amountCents,
      tax_cents: totals.taxCents,
      total_cents: totals.totalCents,
      status: 'pending',
      billing_period: frequency,
      period_start: period.startIso,
      period_end: period.endIso,
      due_date: dueDate,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    // Race: another cron replica may have inserted the row. Re-read and
    // return existing if we lost the race.
    const retry = await supabase
      .from('invoices')
      .select('id')
      .eq('rider_id', riderId)
      .eq('billing_period', frequency)
      .eq('period_start', period.startIso)
      .eq('period_end', period.endIso)
      .maybeSingle();
    if (retry.data) {
      return {
        riderId,
        status: 'existing',
        invoiceId: (retry.data as { id: string }).id,
        rideCount: 0,
      };
    }
    log.error({ event: 'billing.consolidate.insertFail' }, 'insert failed');
    return { riderId, status: 'empty', rideCount: 0 };
  }

  const invoiceId = (inserted as { id: string }).id;

  await supabase.from('invoice_line_items').insert(
    rides.map((r) => ({
      invoice_id: invoiceId,
      ride_id: r.id,
      description: `Ride ${r.completed_at?.slice(0, 10) ?? ''} (${r.id.slice(0, 8)})`,
      amount_cents: r.fare_cents,
    })),
  );

  await supabase.from('audit_logs').insert({
    user_id: null,
    action: 'invoice_consolidated',
    resource_type: 'invoices',
    resource_id: invoiceId,
    new_values: {
      riderId,
      frequency,
      periodStart: period.startIso,
      periodEnd: period.endIso,
      rideCount: rides.length,
      totalCents: totals.totalCents,
    },
  });

  const account = await supabase
    .from('rider_payment_accounts')
    .select('autopay_enabled')
    .eq('rider_id', riderId)
    .maybeSingle();
  if ((account.data as { autopay_enabled: boolean } | null)?.autopay_enabled) {
    await chargePendingInvoice(invoiceId);
  }

  return { riderId, status: 'created', invoiceId, rideCount: rides.length };
}

async function fetchUninvoicedRides(
  riderId: string,
  period: BillingPeriod,
): Promise<RidePeriodRow[]> {
  const supabase = getServiceRoleSupabase();
  const range = billingPeriodToTimestampRange(period);
  const { data } = await supabase
    .from('rides')
    .select('id, fare_cents, completed_at')
    .eq('rider_id', riderId)
    .eq('status', 'completed')
    .not('fare_cents', 'is', null)
    .gte('completed_at', range.startIso)
    .lt('completed_at', range.endExclusiveIso);

  const candidates = ((data as RidePeriodRow[] | null) ?? []).filter((r) => r.fare_cents != null);
  if (candidates.length === 0) return [];

  const ids = candidates.map((r) => r.id);
  const invoiced = await supabase
    .from('invoice_line_items')
    .select('ride_id, invoices!inner(status)')
    .in('ride_id', ids);
  const invoicedRows =
    (invoiced.data as Array<{
      ride_id: string;
      invoices: { status: string } | { status: string }[];
    }> | null) ?? [];
  const invoicedSet = new Set<string>();
  for (const row of invoicedRows) {
    const statusObj = Array.isArray(row.invoices) ? row.invoices[0] : row.invoices;
    if (statusObj && statusObj.status !== 'cancelled') invoicedSet.add(row.ride_id);
  }

  return candidates.filter((r) => !invoicedSet.has(r.id));
}

async function nextInvoiceNumber(
  supabase: ReturnType<typeof getServiceRoleSupabase>,
  referenceDate: Date,
): Promise<string> {
  const dayStart = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
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
  return buildInvoiceNumber(referenceDate, sequence);
}
