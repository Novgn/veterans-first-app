/**
 * Operational metrics — Story 5.10
 *
 * Pure aggregator. The report page hands this a flat ride list; this
 * module produces totals, rates, and a per-day bucketing so the UI is a
 * thin presenter.
 */

export interface RideForOperationalMetrics {
  id: string;
  status: string;
  scheduledPickupTime: string | null;
  completedAt: string | null;
}

export interface OperationalWindowSummary {
  totalRides: number;
  completedRides: number;
  noShowRides: number;
  cancelledRides: number;
  completionRate: number | null;
  noShowRate: number | null;
  perDay: Array<{
    date: string;
    total: number;
    completed: number;
    noShow: number;
    cancelled: number;
  }>;
}

function toIsoDate(input: string | null): string | null {
  if (!input) return null;
  const iso = input.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return iso;
}

export function summarizeOperationalRides(
  rides: RideForOperationalMetrics[]
): OperationalWindowSummary {
  let completedRides = 0;
  let noShowRides = 0;
  let cancelledRides = 0;
  const totalRides = rides.length;
  const perDayMap = new Map<
    string,
    { total: number; completed: number; noShow: number; cancelled: number }
  >();

  for (const ride of rides) {
    if (ride.status === "completed") completedRides += 1;
    else if (ride.status === "no_show") noShowRides += 1;
    else if (ride.status === "cancelled") cancelledRides += 1;

    const bucketDate = toIsoDate(ride.scheduledPickupTime) ?? toIsoDate(ride.completedAt);
    if (!bucketDate) continue;
    const prev = perDayMap.get(bucketDate) ?? { total: 0, completed: 0, noShow: 0, cancelled: 0 };
    prev.total += 1;
    if (ride.status === "completed") prev.completed += 1;
    if (ride.status === "no_show") prev.noShow += 1;
    if (ride.status === "cancelled") prev.cancelled += 1;
    perDayMap.set(bucketDate, prev);
  }

  const perDay = Array.from(perDayMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const rate = (numerator: number, denominator: number): number | null =>
    denominator === 0 ? null : numerator / denominator;

  return {
    totalRides,
    completedRides,
    noShowRides,
    cancelledRides,
    completionRate: rate(completedRides, totalRides),
    noShowRate: rate(noShowRides, totalRides),
    perDay,
  };
}

export function formatRatePercent(rate: number | null): string {
  if (rate == null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

export const OPERATIONAL_WINDOW_OPTIONS = [
  { value: "today", label: "Today", days: 1 },
  { value: "7d", label: "Past 7 days", days: 7 },
  { value: "30d", label: "Past 30 days", days: 30 },
] as const;

export type OperationalWindowOption = (typeof OPERATIONAL_WINDOW_OPTIONS)[number]["value"];

export function windowToRange(
  value: OperationalWindowOption,
  reference: Date = new Date()
): { startIso: string; endExclusiveIso: string } {
  const refUtc = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate())
  );
  const days = OPERATIONAL_WINDOW_OPTIONS.find((o) => o.value === value)?.days ?? 1;
  const start = new Date(refUtc);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const endExclusive = new Date(refUtc);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  return {
    startIso: start.toISOString(),
    endExclusiveIso: endExclusive.toISOString(),
  };
}
