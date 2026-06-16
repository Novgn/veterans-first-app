/**
 * Driver earnings detail (Story 5.8).
 *
 * Shows every earnings row in the selected pay period plus a link to
 * the CSV export route.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  billingPeriodToTimestampRange,
  previousBillingPeriod,
  type BillingFrequency,
} from '@veterans-first/shared/utils';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDateTime, formatMoneyCents } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface EarningRow {
  id: string;
  ride_id: string;
  gross_amount_cents: number;
  company_fee_cents: number;
  net_amount_cents: number;
  created_at: string;
}

async function fetchDriver(driverId: string) {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('id', driverId)
    .eq('role', 'driver')
    .maybeSingle();
  return data as { id: string; first_name: string; last_name: string } | null;
}

async function fetchEarnings(driverId: string, frequency: BillingFrequency) {
  const period = previousBillingPeriod(frequency, new Date());
  const range = billingPeriodToTimestampRange(period);
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('driver_earnings')
    .select('id, ride_id, gross_amount_cents, company_fee_cents, net_amount_cents, created_at')
    .eq('driver_id', driverId)
    .gte('created_at', range.startIso)
    .lt('created_at', range.endExclusiveIso)
    .order('created_at', { ascending: false });
  return {
    period,
    rows: (data as EarningRow[] | null) ?? [],
  };
}

export default async function DriverEarningsDetailPage(props: {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { driverId } = await props.params;
  const { period = 'weekly' } = await props.searchParams;
  const frequency: BillingFrequency = period === 'monthly' ? 'monthly' : 'weekly';

  const [driver, earnings] = await Promise.all([
    fetchDriver(driverId),
    fetchEarnings(driverId, frequency),
  ]);
  if (!driver) notFound();

  const totals = earnings.rows.reduce(
    (acc, r) => ({
      gross: acc.gross + r.gross_amount_cents,
      fee: acc.fee + r.company_fee_cents,
      net: acc.net + r.net_amount_cents,
    }),
    { gross: 0, fee: 0, net: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/business/drivers"
            className="text-callout font-semibold text-navy hover:underline"
          >
            ← All drivers
          </Link>
          <h2 className="mt-1 text-title-2 font-semibold text-ink">
            {driver.last_name}, {driver.first_name}
          </h2>
          <p className="text-body text-ink-secondary">
            {earnings.period.startIso} → {earnings.period.endIso}
          </p>
        </div>
        <Link href={`/api/business/earnings.csv?driverId=${driverId}&period=${frequency}`}>
          <Button variant="outline">Export CSV</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-2 text-body text-ink">
            <dt className="text-ink-secondary">Rides</dt>
            <dd>{earnings.rows.length}</dd>
            <dt className="text-ink-secondary">Gross</dt>
            <dd>{formatMoneyCents(totals.gross)}</dd>
            <dt className="text-ink-secondary">Company fee</dt>
            <dd>{formatMoneyCents(totals.fee)}</dd>
            <dt className="font-semibold text-ink-secondary">Net</dt>
            <dd className="font-semibold">{formatMoneyCents(totals.net)}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.rows.length === 0 ? (
            <p className="text-body text-ink-secondary">No earnings this period.</p>
          ) : (
            <ul className="divide-y divide-border-hairline text-body">
              {earnings.rows.map((r) => (
                <li key={r.id} className="flex justify-between py-3">
                  <div>
                    <div className="font-mono text-caption text-ink-secondary">
                      ride {r.ride_id.slice(0, 8)}
                    </div>
                    <div className="text-caption text-ink-secondary">
                      {formatDateTime(r.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-ink">{formatMoneyCents(r.net_amount_cents)}</div>
                    <div className="text-caption text-ink-secondary">
                      {formatMoneyCents(r.gross_amount_cents)} −{' '}
                      {formatMoneyCents(r.company_fee_cents)} fee
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
