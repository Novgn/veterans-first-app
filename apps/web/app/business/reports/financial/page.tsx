/**
 * Financial report (Story 5.11).
 */

import Link from 'next/link';

import { financialWindowDelta } from '@veterans-first/shared/utils';

import { DashboardCard } from '@/components/business/DashboardCard';
import { Button } from '@/components/ui/Button';
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
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-between">
        <div>
          <h2 className="text-title-2 font-semibold text-ink">Financial summary</h2>
          <p className="mt-1 text-body text-ink-secondary">
            Revenue, outstanding, refunds, and driver payouts.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-end">
          <form
            action="/business/reports/financial"
            method="get"
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <select
              name="window"
              defaultValue={windowValue}
              className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
            >
              {FINANCIAL_WINDOW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button type="submit" className="w-full sm:w-auto">
              Apply
            </Button>
          </form>
          <Link
            href={`/api/business/financial.csv?window=${windowValue}`}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full sm:w-auto">
              Export CSV
            </Button>
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
