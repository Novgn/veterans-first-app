/**
 * Financial reporting helpers — Story 5.11
 *
 * Takes raw invoice/payment/earnings rows and reduces them to the
 * summary a dashboard/CSV needs. Lives in shared/utils so the math is
 * testable and the web route stays thin.
 */

export interface FinancialInvoiceRow {
  totalCents: number;
  status: string;
  createdAt: string;
}

export interface FinancialPaymentRow {
  amountCents: number;
  status: string;
  createdAt: string;
  refundedAmountCents: number | null;
  refundedAt: string | null;
}

export interface FinancialEarningRow {
  netAmountCents: number;
  paidAt: string | null;
  createdAt: string;
}

export interface FinancialWindowSummary {
  revenueCents: number;
  outstandingCents: number;
  refundsCents: number;
  driverPayoutsPendingCents: number;
}

export interface FinancialReportInput {
  invoices: FinancialInvoiceRow[];
  payments: FinancialPaymentRow[];
  earnings: FinancialEarningRow[];
}

export function summarizeFinancialWindow(input: FinancialReportInput): FinancialWindowSummary {
  let revenueCents = 0;
  let outstandingCents = 0;
  for (const inv of input.invoices) {
    if (inv.status === "paid") revenueCents += inv.totalCents;
    else if (inv.status === "pending" || inv.status === "overdue")
      outstandingCents += inv.totalCents;
  }

  let refundsCents = 0;
  for (const p of input.payments) {
    if (p.status === "refunded") refundsCents += p.refundedAmountCents ?? p.amountCents;
  }

  let driverPayoutsPendingCents = 0;
  for (const e of input.earnings) {
    if (!e.paidAt) driverPayoutsPendingCents += e.netAmountCents;
  }

  return {
    revenueCents,
    outstandingCents,
    refundsCents,
    driverPayoutsPendingCents,
  };
}

/**
 * Percent change, null when the previous window has zero denominator so
 * the UI can render "—" instead of "∞%".
 */
export function financialWindowDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}
