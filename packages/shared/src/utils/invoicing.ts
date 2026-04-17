/**
 * Invoicing helpers — Story 5.4
 *
 * Keeping the number generator + totals math out of the DB layer makes
 * the behavior testable without touching postgres. The server-side
 * generator uses these to build the insert payload.
 */

export const INVOICE_NUMBER_PREFIX = "INV";
export const DEFAULT_INVOICE_TERM_DAYS = 14;

export function formatInvoiceDate(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Build a human-friendly, sequential invoice number.
 *
 * `sequence` is the 1-based position for the given day (e.g., the 3rd
 * invoice generated on 2026-04-17 gets sequence=3).
 */
export function buildInvoiceNumber(date: Date, sequence: number): string {
  const dateStr = formatInvoiceDate(date);
  const seq = sequence.toString().padStart(4, "0");
  return `${INVOICE_NUMBER_PREFIX}-${dateStr}-${seq}`;
}

export interface InvoiceTotals {
  amountCents: number;
  taxCents: number;
  totalCents: number;
}

export function computeInvoiceTotals(amountCents: number, taxCents = 0): InvoiceTotals {
  return {
    amountCents,
    taxCents,
    totalCents: amountCents + taxCents,
  };
}

/**
 * Net-N due date. Caller passes the "completed" date; we add term days
 * and return the ISO yyyy-mm-dd string for the `date` column.
 */
export function computeDueDate(
  completedAt: Date,
  termDays: number = DEFAULT_INVOICE_TERM_DAYS
): string {
  const due = new Date(completedAt.getTime());
  due.setUTCDate(due.getUTCDate() + termDays);
  return due.toISOString().slice(0, 10);
}

export const INVOICE_STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const BILLING_PERIODS = ["per_ride", "weekly", "monthly"] as const;
export type InvoiceBillingPeriod = (typeof BILLING_PERIODS)[number];
