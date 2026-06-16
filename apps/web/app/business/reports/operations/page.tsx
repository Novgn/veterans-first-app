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
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-title-2 font-semibold text-ink">Operational metrics</h2>
          <p className="mt-1 text-body text-ink-secondary">Rides, completion, and no-shows.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <form action="/business/reports/operations" method="get" className="flex items-end gap-2">
            <select
              name="window"
              defaultValue={window}
              className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
            >
              {OPERATIONAL_WINDOW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button type="submit">Apply</Button>
          </form>
          <Link href={`/api/business/operations.csv?window=${window}`}>
            <Button variant="outline">Export CSV</Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Per-day breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.perDay.length === 0 ? (
            <p className="text-body text-ink-secondary">No rides in this window.</p>
          ) : (
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full text-body">
                <thead className="border-y border-border-hairline bg-stone text-left">
                  <tr>
                    <th className="px-6 py-3 text-caption font-semibold text-ink-secondary">
                      Date
                    </th>
                    <th className="px-6 py-3 text-caption font-semibold text-ink-secondary">
                      Total
                    </th>
                    <th className="px-6 py-3 text-caption font-semibold text-ink-secondary">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-caption font-semibold text-ink-secondary">
                      No-show
                    </th>
                    <th className="px-6 py-3 text-caption font-semibold text-ink-secondary">
                      Cancelled
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.perDay.map((row) => (
                    <tr
                      key={row.date}
                      className="border-t border-border-hairline text-ink transition-colors hover:bg-navy-100"
                    >
                      <td className="px-6 py-3">{row.date}</td>
                      <td className="px-6 py-3">{row.total}</td>
                      <td className="px-6 py-3">{row.completed}</td>
                      <td className="px-6 py-3">{row.noShow}</td>
                      <td className="px-6 py-3">{row.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
