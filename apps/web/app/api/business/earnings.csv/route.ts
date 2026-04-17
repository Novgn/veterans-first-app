/**
 * Driver earnings CSV export (Story 5.8).
 *
 * Admin-only. Accepts ?driverId + ?period=weekly|monthly and streams a
 * CSV with one row per earning. Escapes values to avoid formula
 * injection in spreadsheets (CWE-1236).
 */

import { NextResponse } from 'next/server';

import {
  billingPeriodToTimestampRange,
  previousBillingPeriod,
  type BillingFrequency,
} from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { toCsv } from '@/lib/csv';
import { getServerSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    return new NextResponse('forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const driverId = url.searchParams.get('driverId');
  const periodParam = url.searchParams.get('period');
  const frequency: BillingFrequency = periodParam === 'monthly' ? 'monthly' : 'weekly';

  if (!driverId) return new NextResponse('missing driverId', { status: 400 });

  const period = previousBillingPeriod(frequency, new Date());
  const range = billingPeriodToTimestampRange(period);

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('driver_earnings')
    .select('id, ride_id, gross_amount_cents, company_fee_cents, net_amount_cents, created_at')
    .eq('driver_id', driverId)
    .gte('created_at', range.startIso)
    .lt('created_at', range.endExclusiveIso)
    .order('created_at');

  const rows =
    (data as Array<{
      id: string;
      ride_id: string;
      gross_amount_cents: number;
      company_fee_cents: number;
      net_amount_cents: number;
      created_at: string;
    }> | null) ?? [];

  const csv = toCsv([
    [
      'earning_id',
      'ride_id',
      'gross_amount_cents',
      'company_fee_cents',
      'net_amount_cents',
      'created_at',
    ],
    ...rows.map((r) => [
      r.id,
      r.ride_id,
      r.gross_amount_cents,
      r.company_fee_cents,
      r.net_amount_cents,
      r.created_at,
    ]),
  ]);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="earnings-${driverId}-${period.startIso}_${period.endIso}.csv"`,
    },
  });
}
