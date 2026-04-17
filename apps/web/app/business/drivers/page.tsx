/**
 * Driver pay summary (Story 5.8).
 *
 * Pay-period aggregation across driver_earnings. Defaults to the
 * previous week; admin can switch to monthly via the query string.
 */

import Link from 'next/link';

import {
  billingPeriodToTimestampRange,
  previousBillingPeriod,
  type BillingFrequency,
} from '@veterans-first/shared/utils';

import { formatMoneyCents } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface DriverEarningsSummary {
  driverId: string;
  firstName: string;
  lastName: string;
  rideCount: number;
  grossCents: number;
  companyFeeCents: number;
  netCents: number;
}

async function fetchSummary(frequency: BillingFrequency): Promise<{
  period: { startIso: string; endIso: string };
  rows: DriverEarningsSummary[];
}> {
  const period = previousBillingPeriod(frequency, new Date());
  const range = billingPeriodToTimestampRange(period);
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('driver_earnings')
      .select('driver_id, gross_amount_cents, company_fee_cents, net_amount_cents')
      .gte('created_at', range.startIso)
      .lt('created_at', range.endExclusiveIso);
    const earnings =
      (data as Array<{
        driver_id: string;
        gross_amount_cents: number;
        company_fee_cents: number;
        net_amount_cents: number;
      }> | null) ?? [];

    const agg = new Map<string, DriverEarningsSummary>();
    for (const row of earnings) {
      const prev =
        agg.get(row.driver_id) ??
        ({
          driverId: row.driver_id,
          firstName: '',
          lastName: '',
          rideCount: 0,
          grossCents: 0,
          companyFeeCents: 0,
          netCents: 0,
        } as DriverEarningsSummary);
      prev.rideCount += 1;
      prev.grossCents += row.gross_amount_cents;
      prev.companyFeeCents += row.company_fee_cents;
      prev.netCents += row.net_amount_cents;
      agg.set(row.driver_id, prev);
    }

    if (agg.size === 0)
      return { period: { startIso: period.startIso, endIso: period.endIso }, rows: [] };

    const ids = Array.from(agg.keys());
    const users = await supabase.from('users').select('id, first_name, last_name').in('id', ids);
    const userRows =
      (users.data as Array<{ id: string; first_name: string; last_name: string }> | null) ?? [];
    for (const u of userRows) {
      const existing = agg.get(u.id);
      if (existing) {
        existing.firstName = u.first_name;
        existing.lastName = u.last_name;
      }
    }

    return {
      period: { startIso: period.startIso, endIso: period.endIso },
      rows: Array.from(agg.values()).sort((a, b) => b.netCents - a.netCents),
    };
  } catch {
    return { period: { startIso: period.startIso, endIso: period.endIso }, rows: [] };
  }
}

export default async function BusinessDriversPage(props: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = 'weekly' } = await props.searchParams;
  const frequency: BillingFrequency = period === 'monthly' ? 'monthly' : 'weekly';
  const { period: window, rows } = await fetchSummary(frequency);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Driver earnings</h2>
          <p className="text-sm text-zinc-600">
            Pay period {window.startIso} → {window.endIso}.
          </p>
        </div>
        <form action="/business/drivers" method="get" className="flex gap-2">
          <select
            name="period"
            defaultValue={frequency}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
          >
            <option value="weekly">Previous week</option>
            <option value="monthly">Previous month</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No earnings for this window.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Rides</th>
                <th className="px-4 py-2">Gross</th>
                <th className="px-4 py-2">Company fee</th>
                <th className="px-4 py-2">Net</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.driverId} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {r.lastName || '—'}
                    {r.firstName ? `, ${r.firstName}` : ''}
                  </td>
                  <td className="px-4 py-2">{r.rideCount}</td>
                  <td className="px-4 py-2">{formatMoneyCents(r.grossCents)}</td>
                  <td className="px-4 py-2">{formatMoneyCents(r.companyFeeCents)}</td>
                  <td className="px-4 py-2 font-semibold">{formatMoneyCents(r.netCents)}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/business/drivers/${r.driverId}?period=${frequency}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
