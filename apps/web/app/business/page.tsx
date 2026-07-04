import { formatRatePercent } from '@veterans-first/shared/utils';

import { DashboardCard } from '@/components/business/DashboardCard';
import { formatMoneyCents } from '@/lib/format';
import { loadBusinessDashboard } from '@/lib/dashboard/loadBusinessDashboard';

export const dynamic = 'force-dynamic';

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
            tile and the report always show the same number. */}
        <DashboardCard
          title="No-show rate"
          value={formatRatePercent(data.noShowRate)}
          hint="No-shows ÷ total rides · last 30 days"
          href="/business/reports/operations?window=30d"
        />
      </div>

      <div className="rounded-lg border border-border-hairline bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-title-3 font-semibold text-ink">Revenue by month</h3>
          <span className="text-caption text-ink-secondary">Last 6 months · paid invoices</span>
        </div>
        <div className="mt-6 flex items-end gap-4" style={{ height: '180px' }}>
          {data.monthlyRevenue.map((month) => {
            const barPx = Math.round((month.cents / maxMonthlyCents) * 160);
            return (
              <div key={month.key} className="flex flex-1 flex-col items-center justify-end gap-2">
                <span className="text-caption text-ink-secondary">
                  {formatMoneyCents(month.cents)}
                </span>
                <div
                  className={`w-full max-w-[56px] rounded-t-lg ${
                    month.isCurrent ? 'bg-sage' : 'bg-navy'
                  }`}
                  style={{ height: `${barPx}px` }}
                />
                <span
                  className={`text-caption ${
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
    </div>
  );
}
