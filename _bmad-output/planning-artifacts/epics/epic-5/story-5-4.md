# Story 5.4: Implement Invoice Generation

**Status:** done

## Story

As the business, I want an invoice generated for each completed ride, so billing is accurate, sequential, and auditable (FR57).

## Acceptance Criteria

1. **Given** a ride reaches status `completed` with a non-null `fare_cents`, **When** `generateInvoiceForRide(rideId)` runs, **Then** a new `invoices` row is inserted with a unique `invoice_number` (format `INV-YYYYMMDD-NNNN`), `rider_id`, `ride_id`, `amount_cents=fare_cents`, `tax_cents=0`, `total_cents=fare_cents`, `billing_period='per_ride'`, and `due_date` = ride completion date + 14 days.
2. **Given** the same ride is passed twice (duplicate event), **Then** only one invoice row exists — `(ride_id)` uniqueness is enforced (no duplicate invoices for the same ride in per_ride mode).
3. **Given** an invoice row exists, **Then** the admin billing list at `/business/billing` shows it with rider name, ride date, total, and status.
4. **Given** an admin drills into an invoice, **Then** they see the line breakdown (single ride line for per-ride invoices; multiple lines for Story 5.6 consolidated invoices).

## Implementation

- `packages/shared/src/utils/invoicing.ts` — pure helpers:
  - `nextInvoiceNumber(existingCount, date)` — deterministic sequential number generator.
  - `computeInvoiceTotals(amountCents, taxCents?)` — defaults tax to 0.
  - `computeDueDate(completedAt, termDays=14)` — returns YYYY-MM-DD.
- `generateInvoiceForRide` server function at `apps/web/lib/billing/generateInvoice.ts`:
  - Reads ride + rider with service role supabase.
  - Guards on fare_cents present, status=completed.
  - Inserts invoice row; on unique-violation (ride_id) returns the existing invoice.
  - Writes an audit_logs entry.
- `/business/billing/page.tsx` list page with filter-by-status.
- `/business/billing/[invoiceId]/page.tsx` detail page with line items.

## Tests

- `invoicing.test.ts` — 3 cases for number generator + due date computation.

## Dev Notes

- Safer choice: not auto-triggering on status transition. Ride completion flows already write rides rows directly; wiring a trigger would couple billing to the hot path. Instead, expose `generateInvoiceForRide` as a callable helper that Story 3.4 (future) + a scheduled catch-up job call. The scheduled job (`sweepInvoices`) scans the last 30 days of completed rides without invoices and generates them — missing from this story but queued in deferred findings as a scheduled task.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
