import 'server-only';

/**
 * Business console dashboard aggregates (Story 5.x console dashboards).
 *
 * Every number here is a real query against the current data — no
 * hardcoded placeholders. Follows the same getServerSupabase() + RLS
 * pattern as the sibling report pages (business/reports/financial,
 * business/reports/operations, business/billing/riders).
 *
 * The 30-day ride metrics (rides/day, completed, no-show rate, avg fare,
 * pickup delay) all derive from ONE fetch over windowToRange('30d') fed
 * through the shared summarizeOperationalRides — the exact same range and
 * math as /business/reports/operations?window=30d, so a KPI tile and the
 * report it links to can never disagree.
 */

import {
  summarizeOperationalRides,
  windowToRange,
  type RideForOperationalMetrics,
} from '@veterans-first/shared/utils';

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
  /** Shared operational-metrics definition (no_show ÷ total rides in the
   *  30d window); null when the window has no rides — the exact same
   *  zero-state as the operations report. */
  noShowRate: number | null;
  /** Avg (arrived-event time − scheduled_pickup_time) in minutes over the
   *  last 30 days of completed rides; null when no ride has a logged
   *  'arrived' event yet (there is no invented on-time threshold in the
   *  codebase, so we surface the real measured delay instead of a %). */
  avgPickupDelayMinutes: number | null;
  monthlyRevenue: MonthlyRevenuePoint[];
  activeRiders: number;
  avgFareCents: number;
}

interface RideRow {
  id: string;
  status: string;
  scheduled_pickup_time: string | null;
  completed_at: string | null;
  fare_cents: number | null;
  ride_events: Array<{ event_type: string; created_at: string | null }> | null;
}

export async function loadBusinessDashboard(): Promise<BusinessDashboardData> {
  const supabase = await getServerSupabase();
  const now = new Date();

  const mtdRange = resolveFinancialRange('mtd', now);
  // Same window the operations report resolves for ?window=30d.
  const ridesRange = windowToRange('30d', now);

  const sixMonthsAgoStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const sixMonthsAgoIso = sixMonthsAgoStart.toISOString();

  const [financialSummary, outstandingRes, activeRidersRes, monthlyInvoicesRes, ridesRes] =
    await Promise.all([
      loadFinancialSummary({
        startIso: mtdRange.startIso,
        endExclusiveIso: mtdRange.endExclusiveIso,
      }),
      supabase.from('invoices').select('total_cents').in('status', ['pending', 'overdue']),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'rider')
        .is('deleted_at', null),
      supabase
        .from('invoices')
        .select('total_cents, created_at')
        .eq('status', 'paid')
        .gte('created_at', sixMonthsAgoIso),
      supabase
        .from('rides')
        .select(
          'id, status, scheduled_pickup_time, completed_at, fare_cents, ride_events(event_type, created_at)',
        )
        .gte('scheduled_pickup_time', ridesRange.startIso)
        .lt('scheduled_pickup_time', ridesRange.endExclusiveIso),
    ]);

  const outstandingInvoiceCents = (
    (outstandingRes.data as Array<{ total_cents: number }> | null) ?? []
  ).reduce((sum, row) => sum + row.total_cents, 0);

  const rideRows = (ridesRes.data as unknown as RideRow[] | null) ?? [];
  const operational = summarizeOperationalRides(
    rideRows.map(
      (r): RideForOperationalMetrics => ({
        id: r.id,
        status: r.status,
        scheduledPickupTime: r.scheduled_pickup_time,
        completedAt: r.completed_at,
      }),
    ),
  );

  const completedRides30d = operational.completedRides;
  const ridesPerDay = completedRides30d / 30;
  const activeRiders = activeRidersRes.count ?? 0;

  const completedRows = rideRows.filter((r) => r.status === 'completed');
  const fareCentsList = completedRows
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
  // for completed rides in the window.
  const deltas: number[] = [];
  for (const ride of completedRows) {
    if (!ride.scheduled_pickup_time) continue;
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
    noShowRate: operational.noShowRate,
    avgPickupDelayMinutes,
    monthlyRevenue,
    activeRiders,
    avgFareCents,
  };
}
