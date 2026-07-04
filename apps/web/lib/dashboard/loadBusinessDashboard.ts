import 'server-only';

/**
 * Business console dashboard aggregates (Story 5.x console dashboards).
 *
 * Every number here is a real query against the current data — no
 * hardcoded placeholders. Follows the same getServerSupabase() + RLS
 * pattern as the sibling report pages (business/reports/financial,
 * business/reports/operations, business/billing/riders).
 */

import { getServerSupabase } from '@/lib/supabase';
import { loadFinancialSummary } from '@/lib/reports/fetchFinancial';
import { resolveFinancialRange } from '@/lib/reports/financialWindow';

export interface MonthlyRevenuePoint {
  key: string;
  label: string;
  cents: number;
  isCurrent: boolean;
}

export interface BusinessDashboardData {
  revenueMtdCents: number;
  outstandingInvoiceCents: number;
  ridesPerDay: number;
  completedRides30d: number;
  noShowRides30d: number;
  noShowRatePercent: number;
  /** Avg (arrived-event time − scheduled_pickup_time) in minutes over the
   *  last 30 days of completed rides; null when no ride has a logged
   *  'arrived' event yet (there is no invented on-time threshold in the
   *  codebase, so we surface the real measured delay instead of a %). */
  avgPickupDelayMinutes: number | null;
  monthlyRevenue: MonthlyRevenuePoint[];
  activeRiders: number;
  avgFareCents: number;
}

interface RideEventRow {
  event_type: string;
  created_at: string | null;
}

interface RideWithEventsRow {
  scheduled_pickup_time: string;
  ride_events: RideEventRow[] | null;
}

export async function loadBusinessDashboard(): Promise<BusinessDashboardData> {
  const supabase = await getServerSupabase();
  const now = new Date();

  const mtdRange = resolveFinancialRange('mtd', now);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  const sixMonthsAgoStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const sixMonthsAgoIso = sixMonthsAgoStart.toISOString();

  const [
    financialSummary,
    outstandingRes,
    completedCountRes,
    noShowCountRes,
    activeRidersRes,
    fareRes,
    monthlyInvoicesRes,
    completedWithEventsRes,
  ] = await Promise.all([
    loadFinancialSummary({
      startIso: mtdRange.startIso,
      endExclusiveIso: mtdRange.endExclusiveIso,
    }),
    supabase.from('invoices').select('total_cents').in('status', ['pending', 'overdue']),
    supabase
      .from('rides')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('scheduled_pickup_time', thirtyDaysAgoIso),
    supabase
      .from('rides')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'no_show')
      .gte('scheduled_pickup_time', thirtyDaysAgoIso),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'rider')
      .is('deleted_at', null),
    supabase
      .from('rides')
      .select('fare_cents')
      .eq('status', 'completed')
      .not('fare_cents', 'is', null)
      .gte('scheduled_pickup_time', thirtyDaysAgoIso),
    supabase
      .from('invoices')
      .select('total_cents, created_at')
      .eq('status', 'paid')
      .gte('created_at', sixMonthsAgoIso),
    supabase
      .from('rides')
      .select('scheduled_pickup_time, ride_events(event_type, created_at)')
      .eq('status', 'completed')
      .gte('scheduled_pickup_time', thirtyDaysAgoIso),
  ]);

  const outstandingInvoiceCents = (
    (outstandingRes.data as Array<{ total_cents: number }> | null) ?? []
  ).reduce((sum, row) => sum + row.total_cents, 0);

  const completedRides30d = completedCountRes.count ?? 0;
  const noShowRides30d = noShowCountRes.count ?? 0;
  const concluded = completedRides30d + noShowRides30d;
  const noShowRatePercent = concluded > 0 ? (noShowRides30d / concluded) * 100 : 0;
  const ridesPerDay = completedRides30d / 30;
  const activeRiders = activeRidersRes.count ?? 0;

  const fareRows = (fareRes.data as Array<{ fare_cents: number | null }> | null) ?? [];
  const fareCentsList = fareRows
    .map((r) => r.fare_cents)
    .filter((c): c is number => typeof c === 'number');
  const avgFareCents =
    fareCentsList.length > 0
      ? Math.round(fareCentsList.reduce((sum, c) => sum + c, 0) / fareCentsList.length)
      : 0;

  // Monthly revenue chart — bucket paid invoices by calendar month (UTC),
  // covering the current month and the 5 before it.
  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthKeys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  const revenueByMonth = new Map<string, number>();
  for (const row of (monthlyInvoicesRes.data as Array<{
    total_cents: number;
    created_at: string;
  }> | null) ?? []) {
    const key = row.created_at.slice(0, 7);
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + row.total_cents);
  }
  const currentKey = monthKeys[monthKeys.length - 1];
  const monthlyRevenue: MonthlyRevenuePoint[] = monthKeys.map((key) => {
    const [y, m] = key.split('-');
    const label = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toLocaleString('en-US', {
      month: 'short',
      timeZone: 'UTC',
    });
    return {
      key,
      label,
      cents: revenueByMonth.get(key) ?? 0,
      isCurrent: key === currentKey,
    };
  });

  // Avg pickup delay — first 'arrived' ride_event vs scheduled_pickup_time,
  // for completed rides in the last 30 days.
  const eventRows = (completedWithEventsRes.data as RideWithEventsRow[] | null) ?? [];
  const deltas: number[] = [];
  for (const ride of eventRows) {
    const arrivedTimes = (ride.ride_events ?? [])
      .filter((e) => e.event_type === 'arrived' && e.created_at)
      .map((e) => new Date(e.created_at as string).getTime())
      .sort((a, b) => a - b);
    if (arrivedTimes.length === 0) continue;
    const scheduledMs = new Date(ride.scheduled_pickup_time).getTime();
    deltas.push((arrivedTimes[0]! - scheduledMs) / 60000);
  }
  const avgPickupDelayMinutes =
    deltas.length > 0 ? deltas.reduce((sum, d) => sum + d, 0) / deltas.length : null;

  return {
    revenueMtdCents: financialSummary.revenueCents,
    outstandingInvoiceCents,
    ridesPerDay,
    completedRides30d,
    noShowRides30d,
    noShowRatePercent,
    avgPickupDelayMinutes,
    monthlyRevenue,
    activeRiders,
    avgFareCents,
  };
}
