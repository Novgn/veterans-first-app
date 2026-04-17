import { NextResponse } from 'next/server';

import { financialWindowDelta } from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { toCsv } from '@/lib/csv';
import { loadFinancialSummary } from '@/lib/reports/fetchFinancial';
import {
  FINANCIAL_WINDOW_OPTIONS,
  resolveFinancialRange,
  type FinancialWindowValue,
} from '@/lib/reports/financialWindow';

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    return new NextResponse('forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const windowParam = url.searchParams.get('window') ?? 'mtd';
  const windowValue: FinancialWindowValue =
    FINANCIAL_WINDOW_OPTIONS.find((o) => o.value === windowParam)?.value ?? 'mtd';
  const range = resolveFinancialRange(windowValue);

  const [current, prior] = await Promise.all([
    loadFinancialSummary({ startIso: range.startIso, endExclusiveIso: range.endExclusiveIso }),
    loadFinancialSummary({
      startIso: range.priorStartIso,
      endExclusiveIso: range.priorEndExclusiveIso,
    }),
  ]);

  const csv = toCsv([
    ['metric', 'current_cents', 'prior_cents', 'delta_pct'],
    [
      'revenue',
      current.revenueCents,
      prior.revenueCents,
      formatDelta(financialWindowDelta(current.revenueCents, prior.revenueCents)),
    ],
    [
      'outstanding',
      current.outstandingCents,
      prior.outstandingCents,
      formatDelta(financialWindowDelta(current.outstandingCents, prior.outstandingCents)),
    ],
    [
      'refunds',
      current.refundsCents,
      prior.refundsCents,
      formatDelta(financialWindowDelta(current.refundsCents, prior.refundsCents)),
    ],
    [
      'driver_payouts_pending',
      current.driverPayoutsPendingCents,
      prior.driverPayoutsPendingCents,
      formatDelta(
        financialWindowDelta(current.driverPayoutsPendingCents, prior.driverPayoutsPendingCents),
      ),
    ],
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="financial-${windowValue}.csv"`,
    },
  });
}

function formatDelta(delta: number | null): string {
  if (delta == null) return '';
  return (delta * 100).toFixed(1);
}
