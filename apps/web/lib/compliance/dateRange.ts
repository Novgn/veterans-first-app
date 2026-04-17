import 'server-only';

/**
 * Normalizes compliance report start/end query params into ISO
 * timestamps. Caps at 370 days to keep exports bounded.
 */

export interface ComplianceRange {
  startIso: string;
  endExclusiveIso: string;
  startLabel: string;
  endLabel: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseComplianceRange(
  startParam: string | null,
  endParam: string | null,
  today: Date = new Date(),
): ComplianceRange {
  const fallbackEnd = today.toISOString().slice(0, 10);
  const fallbackStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);

  const startStr = startParam && ISO_DATE.test(startParam) ? startParam : fallbackStart;
  const endStr = endParam && ISO_DATE.test(endParam) ? endParam : fallbackEnd;

  const startDate = new Date(`${startStr}T00:00:00Z`);
  const endDate = new Date(`${endStr}T00:00:00Z`);
  const endExclusive = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

  // Cap window at 370 days to keep exports bounded.
  const maxMs = 370 * 24 * 60 * 60 * 1000;
  const clampedStart =
    endDate.getTime() - startDate.getTime() > maxMs
      ? new Date(endDate.getTime() - maxMs)
      : startDate;

  return {
    startIso: clampedStart.toISOString(),
    endExclusiveIso: endExclusive.toISOString(),
    startLabel: clampedStart.toISOString().slice(0, 10),
    endLabel: endDate.toISOString().slice(0, 10),
  };
}
