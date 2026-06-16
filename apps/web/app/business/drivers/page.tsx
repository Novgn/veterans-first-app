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

import { Button } from '@/components/ui/Button';
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-2 font-semibold text-ink">Driver earnings</h2>
          <p className="mt-1 text-body text-ink-secondary">
            Pay period {window.startIso} → {window.endIso}.
          </p>
        </div>
        <form action="/business/drivers" method="get" className="flex items-end gap-2">
          <select
            name="period"
            defaultValue={frequency}
            className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
          >
            <option value="weekly">Previous week</option>
            <option value="monthly">Previous month</option>
          </select>
          <Button type="submit">Apply</Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-hairline bg-card p-6 text-center text-body text-ink-secondary">
          No earnings for this window.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-hairline bg-card shadow-card">
          <table className="w-full text-body">
            <thead className="border-b border-border-hairline bg-stone text-left">
              <tr>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Driver</th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Rides</th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Gross</th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">
                  Company fee
                </th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Net</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.driverId}
                  className="border-t border-border-hairline text-ink transition-colors hover:bg-navy-100"
                >
                  <td className="px-4 py-3">
                    {r.lastName || '—'}
                    {r.firstName ? `, ${r.firstName}` : ''}
                  </td>
                  <td className="px-4 py-3">{r.rideCount}</td>
                  <td className="px-4 py-3">{formatMoneyCents(r.grossCents)}</td>
                  <td className="px-4 py-3">{formatMoneyCents(r.companyFeeCents)}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoneyCents(r.netCents)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/business/drivers/${r.driverId}?period=${frequency}`}
                      className="text-callout font-semibold text-navy hover:underline"
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
