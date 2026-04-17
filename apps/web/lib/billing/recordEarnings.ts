import 'server-only';

/**
 * Driver earnings recorder (Story 5.8).
 *
 * Idempotent on ride_id via the UNIQUE constraint — duplicate callers
 * see the existing row returned instead of hitting an insert error.
 */

import { computeEarnings, DEFAULT_COMPANY_FEE_RATE } from '@veterans-first/shared/utils';

import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export interface RecordEarningsResult {
  status: 'created' | 'existing' | 'skipped';
  earningId?: string;
  netCents?: number;
}

export async function recordEarningsForRide(
  rideId: string,
  feeRate: number = DEFAULT_COMPANY_FEE_RATE,
): Promise<RecordEarningsResult> {
  const supabase = getServiceRoleSupabase();

  const { data: existing } = await supabase
    .from('driver_earnings')
    .select('id, net_amount_cents')
    .eq('ride_id', rideId)
    .maybeSingle();
  if (existing) {
    const row = existing as { id: string; net_amount_cents: number };
    return { status: 'existing', earningId: row.id, netCents: row.net_amount_cents };
  }

  const { data: rideRow } = await supabase
    .from('rides')
    .select('id, driver_id, fare_cents, status, completed_at')
    .eq('id', rideId)
    .maybeSingle();

  const ride = rideRow as {
    id: string;
    driver_id: string | null;
    fare_cents: number | null;
    status: string;
    completed_at: string | null;
  } | null;

  if (!ride || ride.status !== 'completed' || ride.fare_cents == null || !ride.driver_id) {
    return { status: 'skipped' };
  }

  const split = computeEarnings(ride.fare_cents, feeRate);

  const { data: inserted, error } = await supabase
    .from('driver_earnings')
    .insert({
      driver_id: ride.driver_id,
      ride_id: ride.id,
      gross_amount_cents: split.grossCents,
      company_fee_cents: split.companyFeeCents,
      net_amount_cents: split.netCents,
    })
    .select('id, net_amount_cents')
    .single();

  if (error || !inserted) {
    // Race: another worker inserted first. Re-read.
    const retry = await supabase
      .from('driver_earnings')
      .select('id, net_amount_cents')
      .eq('ride_id', rideId)
      .maybeSingle();
    if (retry.data) {
      const row = retry.data as { id: string; net_amount_cents: number };
      return { status: 'existing', earningId: row.id, netCents: row.net_amount_cents };
    }
    log.error({ event: 'billing.earnings.insertFail' }, 'insert failed');
    return { status: 'skipped' };
  }

  const row = inserted as { id: string; net_amount_cents: number };
  return { status: 'created', earningId: row.id, netCents: row.net_amount_cents };
}
