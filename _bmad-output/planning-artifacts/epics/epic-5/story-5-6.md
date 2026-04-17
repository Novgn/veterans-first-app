# Story 5.6: Implement Recurring Billing

**Status:** done

## Story

As a rider on recurring rides, I want a consolidated weekly/monthly invoice instead of one per ride, so I don't manage dozens of small charges (FR59).

## Acceptance Criteria

1. **Given** a rider's `rider_payment_accounts.billing_frequency` is `weekly` or `monthly`, **When** the consolidation runner is invoked with a period, **Then** it collects all that rider's `completed` rides with `fare_cents` set that aren't already attached to a non-cancelled invoice, and writes a single `invoices` row covering the period with one `invoice_line_items` row per ride.
2. **Given** no uninvoiced rides exist for the period, **Then** no invoice is created (the job is a no-op for that rider).
3. **Given** the period has been processed before, **Then** a rerun is idempotent (no duplicate consolidated invoice for the same rider + period_start + period_end pair).
4. **Given** autopay is enabled on the account, **Then** the consolidated invoice is handed to `chargePendingInvoice` (Story 5.5) so the rider's card is charged.

## Implementation

- `packages/shared/src/utils/billingPeriods.ts` — pure helpers for computing the current + previous billing period window given frequency and a reference date (Sunday-to-Saturday weeks, calendar months). 4 cases covered by tests.
- `apps/web/lib/billing/consolidation.ts` — `consolidateInvoicesForRider(riderId, period)`:
  - Queries uninvoiced completed rides in the window.
  - Invoice-number generator reused from Story 5.4.
  - Writes invoice + line items in a single round, idempotent on `(rider_id, billing_period, period_start, period_end)` via a partial unique index.
  - Optionally calls `chargePendingInvoice` when autopay enabled.
- Migration `0032_invoice_period_unique.sql` adds the partial unique index.

## Tests

- `billingPeriods.test.ts` — 4 cases: previous week boundaries, previous month boundaries, week wrapping across year, month wrapping across year.

## Dev Notes

- Safer choice: storing period_start/period_end on the invoice row (plus the unique index) rather than in a separate `billing_periods` table. The data model stays small, and the unique index gives us at-most-once semantics under concurrent cron retries.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
