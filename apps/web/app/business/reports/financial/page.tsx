/**
 * Financial report (Story 5.11).
 */

import Link from 'next/link';

import { financialWindowDelta } from '@veterans-first/shared/utils';

import { DashboardCard } from '@/components/business/DashboardCard';
import { formatMoneyCents } from '@/lib/format';
import { loadFinancialSummary } from '@/lib/reports/fetchFinancial';
import {
  FINANCIAL_WINDOW_OPTIONS,
  resolveFinancialRange,
  type FinancialWindowValue,
} from '@/lib/reports/financialWindow';

export const dynamic = 'force-dynamic';

function formatDelta(delta: number | null): string {
  if (delta == null) return '—';
  const pct = (delta * 100).toFixed(1);
  return `${delta > 0 ? '+' : ''}${pct}%`;
}

export default async function FinancialReportPage(props: {
  searchParams: Promise<{ window?: string }>;
}) {
  const { window: windowParam = 'mtd' } = await props.searchParams;
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Financial summary</h2>
          <p className="text-sm text-zinc-600">
            Revenue, outstanding, refunds, and driver payouts.
          </p>
        </div>
        <div className="flex gap-2">
          <form action="/business/reports/financial" method="get" className="flex gap-2">
            <select
              name="window"
              defaultValue={windowValue}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
            >
              {FINANCIAL_WINDOW_OPTIONS.map((o) => (
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
            href={`/api/business/financial.csv?window=${windowValue}`}
            className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm"
          >
            Export CSV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard
          title="Revenue"
          value={formatMoneyCents(current.revenueCents)}
          hint={`vs prior: ${formatDelta(financialWindowDelta(current.revenueCents, prior.revenueCents))}`}
        />
        <DashboardCard
          title="Outstanding invoices"
          value={formatMoneyCents(current.outstandingCents)}
          hint={`vs prior: ${formatDelta(financialWindowDelta(current.outstandingCents, prior.outstandingCents))}`}
        />
        <DashboardCard
          title="Refunds"
          value={formatMoneyCents(current.refundsCents)}
          hint={`vs prior: ${formatDelta(financialWindowDelta(current.refundsCents, prior.refundsCents))}`}
        />
        <DashboardCard
          title="Driver payouts pending"
          value={formatMoneyCents(current.driverPayoutsPendingCents)}
          hint={`vs prior: ${formatDelta(financialWindowDelta(current.driverPayoutsPendingCents, prior.driverPayoutsPendingCents))}`}
        />
      </div>
    </div>
  );
}
