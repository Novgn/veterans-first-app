/**
 * Driver earnings calculation — Story 5.8
 *
 * Split the gross fare into company fee + net payout. Pure math so the
 * server helper, scheduled jobs, and future admin overrides can share
 * the same computation.
 */

export const DEFAULT_COMPANY_FEE_RATE = 0.2;

export interface DriverEarningsSplit {
  grossCents: number;
  companyFeeCents: number;
  netCents: number;
}

/**
 * Given a gross fare and fee rate (0–1), compute the company fee (rounded
 * half-to-even to keep sums stable) and the net payout. The fee rate is
 * clamped to [0, 1].
 */
export function computeEarnings(
  fareCents: number,
  feeRate: number = DEFAULT_COMPANY_FEE_RATE
): DriverEarningsSplit {
  if (!Number.isFinite(fareCents) || fareCents < 0) {
    return { grossCents: 0, companyFeeCents: 0, netCents: 0 };
  }
  const rate = Math.min(1, Math.max(0, feeRate));
  const fee = Math.round(fareCents * rate);
  return {
    grossCents: fareCents,
    companyFeeCents: fee,
    netCents: fareCents - fee,
  };
}

/**
 * Sum multiple earnings rows into a single aggregate. Handy for
 * rendering pay-period summaries without touching the DB.
 */
export function aggregateEarnings(
  rows: Array<{ grossAmountCents: number; companyFeeCents: number; netAmountCents: number }>
): DriverEarningsSplit & { count: number } {
  const totals = rows.reduce(
    (acc, row) => ({
      grossCents: acc.grossCents + row.grossAmountCents,
      companyFeeCents: acc.companyFeeCents + row.companyFeeCents,
      netCents: acc.netCents + row.netAmountCents,
    }),
    { grossCents: 0, companyFeeCents: 0, netCents: 0 }
  );
  return { ...totals, count: rows.length };
}
