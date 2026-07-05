import Link from 'next/link';

import { formatRatePercent } from '@veterans-first/shared/utils';

import { DashboardCard } from '@/components/business/DashboardCard';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { formatMoneyCents, humanStatus } from '@/lib/format';
import { loadBusinessDashboard } from '@/lib/dashboard/loadBusinessDashboard';

export const dynamic = 'force-dynamic';

// Invoice / Stripe payment status → semantic Badge variant — same mapping
// business/billing/page.tsx's invoiceStatusVariant uses, so the Dashboard's
// "Recent invoices" chips read identically to the full Billing list.
function invoiceStatusVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'paid':
    case 'succeeded':
      return 'success';
    case 'pending':
    case 'processing':
    case 'overdue':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'secondary';
  }
}

// There is no "on-time" definition anywhere in this codebase (no threshold
// constant, no prior UI). Rather than invent a pass/fail % and label it
// "on-time", this tile reports the real, measured average delay between a
// ride's scheduled pickup time and its first logged 'arrived' ride_event —
// honest about what the data actually supports.
function formatPickupDelay(minutes: number | null): { value: string; hint: string } {
  if (minutes === null) {
    return {
      value: 'No arrivals logged',
      hint: 'No completed rides have pickup-arrival events in the last 30 days.',
    };
  }
  const rounded = Math.round(minutes);
  if (rounded === 0) {
    return { value: 'On schedule', hint: 'Avg pickup arrival vs. scheduled time · last 30 days' };
  }
  const sign = rounded > 0 ? '+' : '';
  return {
    value: `${sign}${rounded} min`,
    hint: 'Avg pickup arrival vs. scheduled time · last 30 days',
  };
}

export default async function BusinessHome() {
  const data = await loadBusinessDashboard();
  const pickupDelay = formatPickupDelay(data.avgPickupDelayMinutes);
  const maxMonthlyCents = Math.max(1, ...data.monthlyRevenue.map((m) => m.cents));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Operations Dashboard</h2>
        <p className="text-body text-ink-secondary">
          Financial, compliance, and operational overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Revenue"
          value={formatMoneyCents(data.revenueMtdCents)}
          hint="Month to date"
          href="/business/reports/financial"
        />
        <DashboardCard
          title="Rides per day"
          value={data.ridesPerDay.toFixed(1)}
          hint="Avg completed · last 30 days"
          href="/business/reports/operations?window=30d"
        />
        <DashboardCard title="Pickup timing" value={pickupDelay.value} hint={pickupDelay.hint} />
        {/* Same definition + formatter as the operations report this links
            to (shared summarizeOperationalRides / formatRatePercent), so the
            tile and the report show the same number whenever rides exist.
            The null (no-rides) case gets explicit copy instead of the
            report's "—" — dashboard tiles never render dead dashes (same
            treatment as the Pickup-timing tile). */}
        <DashboardCard
          title="No-show rate"
          value={data.noShowRate === null ? 'No rides' : formatRatePercent(data.noShowRate)}
          hint={
            data.noShowRate === null
              ? 'No rides in the last 30 days'
              : 'No-shows ÷ total rides · last 30 days'
          }
          href="/business/reports/operations?window=30d"
        />
      </div>

      <div className="rounded-lg border border-border-hairline bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-title-3 font-semibold text-ink">Revenue by month</h3>
          <span className="text-caption text-ink-secondary">Last 6 months · paid invoices</span>
        </div>
        <div className="mt-6 overflow-x-auto overflow-y-hidden">
          <div className="flex items-end gap-4" style={{ height: '204px', minWidth: '440px' }}>
            {data.monthlyRevenue.map((month) => {
              const barPx = Math.round((month.cents / maxMonthlyCents) * 160);
              return (
                <div
                  key={month.key}
                  className="flex min-w-[56px] flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="whitespace-nowrap text-caption text-ink-secondary">
                    {formatMoneyCents(month.cents)}
                  </span>
                  <div
                    className={`w-full max-w-[56px] rounded-t-lg ${
                      month.isCurrent ? 'bg-sage' : 'bg-navy'
                    }`}
                    style={{ height: `${barPx}px` }}
                  />
                  <span
                    className={`whitespace-nowrap text-caption ${
                      month.isCurrent ? 'font-semibold text-ink' : 'text-ink-secondary'
                    }`}
                  >
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Active riders" value={data.activeRiders.toString()} />
        <DashboardCard
          title="Completed rides"
          value={data.completedRides30d.toString()}
          hint="Last 30 days"
          href="/business/reports/operations?window=30d"
        />
        <DashboardCard
          title="Average fare"
          value={formatMoneyCents(data.avgFareCents)}
          hint="Completed rides · last 30 days"
        />
        {/* Unfiltered billing list — the KPI sums pending + overdue, and the
            billing page's status filter is exact-match, so a filtered link
            would hide half the total. */}
        <DashboardCard
          title="Outstanding invoices"
          value={formatMoneyCents(data.outstandingInvoiceCents)}
          hint="Pending + overdue"
          href="/business/billing"
        />
      </div>

      <div className="rounded-lg border border-border-hairline bg-card shadow-card">
        <div className="flex items-center justify-between gap-2 p-6 pb-4">
          <h3 className="text-title-3 font-semibold text-ink">Recent invoices</h3>
          <Link
            href="/business/billing"
            className="text-caption font-semibold text-navy hover:underline"
          >
            View all →
          </Link>
        </div>
        {data.recentInvoices.length === 0 ? (
          <div className="mx-6 mb-6 rounded-lg border border-dashed border-border-hairline p-6 text-center text-body text-ink-secondary">
            No recent invoices yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="border-y border-border-hairline text-left">
                <tr className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                  <th className="px-6 py-3">Payer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border-hairline text-ink last:border-0"
                  >
                    <td className="px-6 py-3">{invoice.payerName}</td>
                    <td className="px-6 py-3 text-ink-secondary">
                      {formatMoneyCents(invoice.amountCents)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={invoiceStatusVariant(invoice.status)}>
                        {humanStatus(invoice.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
