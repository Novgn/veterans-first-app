# Story 5.11: Implement Financial Reports

**Status:** done

## Story

As an admin, I want revenue, outstanding balances, and driver payout totals broken down by period, so I can see the financial picture (FR63).

## Acceptance Criteria

1. **Given** an admin opens `/business/reports/financial`, **Then** they see total revenue (sum of paid invoices), outstanding (sum of pending+overdue invoice totals), driver payouts pending (sum of unpaid driver_earnings.net_amount_cents), and refunds issued in the selected window.
2. **Given** the admin picks a window (month-to-date / past 30 days / past 90 days), **Then** the metrics recompute and a comparison delta vs the previous window of equal length is shown next to each metric.
3. **Given** the admin exports CSV, **Then** the export includes each metric with absolute values and comparison deltas.
4. **Given** there is no data, **Then** zero values render as `$0.00` rather than blank.

## Implementation

- `packages/shared/src/utils/financialReports.ts` — pure aggregator:
  - `summarizeFinancialWindow({ invoices, payments, earnings })` → `{ revenueCents, outstandingCents, refundsCents, driverPayoutsPendingCents }`.
  - `financialWindowDelta(current, previous)` — pct-change helper.
- `/business/reports/financial/page.tsx` with window selector + comparison.
- `/api/business/financial.csv/route.ts`.
- Reuses `toCsv` from Story 5.10.

## Tests

- `financialReports.test.ts` — 3 cases: empty, normal window, zero-denominator delta.

## Dev Notes

- Safer choice: showing comparison delta as null when the previous window has zero revenue (avoids reporting "∞%" for the first month in production).

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
