/**
 * Billing period helpers — Story 5.6
 *
 * Returns the [start, end) date range for the "previous" billing period
 * relative to a reference date. The consolidation cron passes `new Date()`
 * at the top of Monday / first of the month to roll up the prior period.
 *
 * Weeks run Sunday→Saturday (rider-friendly default; ops can change the
 * start-of-week later without breaking the public API).
 */

export type BillingFrequency = "weekly" | "monthly";

export interface BillingPeriod {
  start: Date;
  end: Date;
  startIso: string;
  endIso: string;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function previousBillingPeriod(frequency: BillingFrequency, reference: Date): BillingPeriod {
  if (frequency === "weekly") {
    const ref = new Date(
      Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate())
    );
    // back up to the Sunday before `ref`, then the prior Sunday starts the window.
    const refDay = ref.getUTCDay(); // 0 = Sunday
    const currentSunday = new Date(ref);
    currentSunday.setUTCDate(ref.getUTCDate() - refDay);
    const prevSunday = new Date(currentSunday);
    prevSunday.setUTCDate(currentSunday.getUTCDate() - 7);
    const prevSaturday = new Date(currentSunday);
    prevSaturday.setUTCDate(currentSunday.getUTCDate() - 1);
    return {
      start: prevSunday,
      end: prevSaturday,
      startIso: toIsoDate(prevSunday),
      endIso: toIsoDate(prevSaturday),
    };
  }

  // monthly
  const refYear = reference.getUTCFullYear();
  const refMonth = reference.getUTCMonth();
  const prevMonthStart = new Date(Date.UTC(refYear, refMonth - 1, 1));
  const prevMonthEnd = new Date(Date.UTC(refYear, refMonth, 0));
  return {
    start: prevMonthStart,
    end: prevMonthEnd,
    startIso: toIsoDate(prevMonthStart),
    endIso: toIsoDate(prevMonthEnd),
  };
}

/**
 * Returns a half-open [start, end) window bracketing the period for use
 * in a timestamp range query — 00:00 on start_date to 00:00 on the day
 * after end_date.
 */
export function billingPeriodToTimestampRange(period: BillingPeriod): {
  startIso: string;
  endExclusiveIso: string;
} {
  const endPlusOne = new Date(period.end);
  endPlusOne.setUTCDate(endPlusOne.getUTCDate() + 1);
  return {
    startIso: new Date(
      Date.UTC(period.start.getUTCFullYear(), period.start.getUTCMonth(), period.start.getUTCDate())
    ).toISOString(),
    endExclusiveIso: new Date(
      Date.UTC(endPlusOne.getUTCFullYear(), endPlusOne.getUTCMonth(), endPlusOne.getUTCDate())
    ).toISOString(),
  };
}
