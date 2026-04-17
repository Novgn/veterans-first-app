/**
 * Operational metrics report (Story 5.10).
 */

import Link from 'next/link';

import {
  formatRatePercent,
  OPERATIONAL_WINDOW_OPTIONS,
  summarizeOperationalRides,
  windowToRange,
  type OperationalWindowOption,
  type RideForOperationalMetrics,
} from '@veterans-first/shared/utils';

import { DashboardCard } from '@/components/business/DashboardCard';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function fetchRides(window: OperationalWindowOption): Promise<RideForOperationalMetrics[]> {
  try {
    const supabase = await getServerSupabase();
    const range = windowToRange(window);
    const { data } = await supabase
      .from('rides')
      .select('id, status, scheduled_pickup_time, completed_at')
      .gte('scheduled_pickup_time', range.startIso)
      .lt('scheduled_pickup_time', range.endExclusiveIso);
    const rows =
      (data as Array<{
        id: string;
        status: string;
        scheduled_pickup_time: string | null;
        completed_at: string | null;
      }> | null) ?? [];
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      scheduledPickupTime: r.scheduled_pickup_time,
      completedAt: r.completed_at,
    }));
  } catch {
    return [];
  }
}

export default async function OperationsReportPage(props: {
  searchParams: Promise<{ window?: string }>;
}) {
  const { window: windowParam = '7d' } = await props.searchParams;
  const window: OperationalWindowOption =
    OPERATIONAL_WINDOW_OPTIONS.find((o) => o.value === windowParam)?.value ?? '7d';
  const rides = await fetchRides(window);
  const summary = summarizeOperationalRides(rides);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Operational metrics</h2>
          <p className="text-sm text-zinc-600">Rides, completion, and no-shows.</p>
        </div>
        <div className="flex gap-2">
          <form action="/business/reports/operations" method="get" className="flex gap-2">
            <select
              name="window"
              defaultValue={window}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            >
              {OPERATIONAL_WINDOW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </form>
          <Link
            href={`/api/business/operations.csv?window=${window}`}
            className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm"
          >
            Export CSV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard title="Total rides" value={summary.totalRides.toString()} />
        <DashboardCard title="Completion rate" value={formatRatePercent(summary.completionRate)} />
        <DashboardCard title="No-show rate" value={formatRatePercent(summary.noShowRate)} />
        <DashboardCard title="Completed" value={summary.completedRides.toString()} />
        <DashboardCard title="No-show" value={summary.noShowRides.toString()} />
        <DashboardCard title="Cancelled" value={summary.cancelledRides.toString()} />
      </div>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Per-day breakdown</h3>
        {summary.perDay.length === 0 ? (
          <p className="text-sm text-zinc-500">No rides in this window.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Completed</th>
                  <th className="px-3 py-2">No-show</th>
                  <th className="px-3 py-2">Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {summary.perDay.map((row) => (
                  <tr key={row.date} className="border-t border-zinc-100">
                    <td className="px-3 py-2">{row.date}</td>
                    <td className="px-3 py-2">{row.total}</td>
                    <td className="px-3 py-2">{row.completed}</td>
                    <td className="px-3 py-2">{row.noShow}</td>
                    <td className="px-3 py-2">{row.cancelled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
