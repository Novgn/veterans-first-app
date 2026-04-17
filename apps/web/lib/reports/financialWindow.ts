import 'server-only';

/**
 * Financial report window helpers (Story 5.11).
 *
 * Resolves a window string (mtd / 30d / 90d) into [start, end) dates +
 * the equivalent prior-window range (for comparison deltas).
 */

export type FinancialWindowValue = 'mtd' | '30d' | '90d';

export const FINANCIAL_WINDOW_OPTIONS: Array<{ value: FinancialWindowValue; label: string }> = [
  { value: 'mtd', label: 'Month to date' },
  { value: '30d', label: 'Past 30 days' },
  { value: '90d', label: 'Past 90 days' },
];

export interface FinancialRange {
  startIso: string;
  endExclusiveIso: string;
  priorStartIso: string;
  priorEndExclusiveIso: string;
}

export function resolveFinancialRange(
  value: FinancialWindowValue,
  reference: Date = new Date(),
): FinancialRange {
  const refUtc = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()),
  );
  const endExclusive = new Date(refUtc);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  if (value === 'mtd') {
    const start = new Date(Date.UTC(refUtc.getUTCFullYear(), refUtc.getUTCMonth(), 1));
    const priorStart = new Date(Date.UTC(refUtc.getUTCFullYear(), refUtc.getUTCMonth() - 1, 1));
    const priorEnd = start;
    return {
      startIso: start.toISOString(),
      endExclusiveIso: endExclusive.toISOString(),
      priorStartIso: priorStart.toISOString(),
      priorEndExclusiveIso: priorEnd.toISOString(),
    };
  }

  const days = value === '30d' ? 30 : 90;
  const start = new Date(refUtc);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const priorStart = new Date(start);
  priorStart.setUTCDate(priorStart.getUTCDate() - days);
  const priorEnd = start;
  return {
    startIso: start.toISOString(),
    endExclusiveIso: endExclusive.toISOString(),
    priorStartIso: priorStart.toISOString(),
    priorEndExclusiveIso: priorEnd.toISOString(),
  };
}
