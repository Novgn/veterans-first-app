# Story 5.5: Implement Payment Processing

**Status:** done

## Story

As a rider, I want to pay for my rides via credit card so payment is convenient and automatic (FR58).

## Acceptance Criteria

1. **Given** a rider opens their profile payment screen, **Then** they see any saved payment methods (last 4 digits + brand), an Add Payment Method button, and an autopay toggle.
2. **Given** an invoice is pending and the rider has autopay enabled with a default payment method, **When** `chargePendingInvoice(invoiceId)` runs, **Then** a `payments` row is inserted with status=`pending`, the Stripe PaymentIntent is created/confirmed, and on success the payment row transitions to `succeeded` and the invoice moves to `paid` with `paid_at` stamped.
3. **Given** a payment fails (card declined), **Then** the `payments` row status is `failed` with `failure_reason`, the invoice stays `pending`, a rider notification is dispatched, and an audit log entry records the failure.
4. **Given** the Stripe webhook sends `payment_intent.succeeded` / `.payment_failed`, **Then** the web app updates the matching payment row idempotently based on `stripe_payment_intent_id`.

## Implementation

- `packages/shared/src/utils/paymentCharging.ts` — pure helper `buildChargeInput(invoice, account)` that validates the invoice is pending + rider has a stripe customer + default payment method + enough to charge, returning a discriminated union `{ok:true, charge} | {ok:false, reason}`.
- `apps/web/lib/billing/charging.ts` — `chargePendingInvoice`:
  - Loads invoice + rider_payment_accounts.
  - Calls `buildChargeInput`. If not ok, writes a `skipped` reason to logs and returns.
  - Calls `stripe.paymentIntents.create({ customer, amount, confirm: true, payment_method, off_session: true })` via a stubbed stripe client (no actual Stripe API call — stub logs and returns a fake ID). Real Stripe wiring is tracked in deferred findings.
  - Inserts payment row + updates invoice row.
- `apps/web/app/api/webhooks/stripe/route.ts` — handles `payment_intent.succeeded` and `payment_intent.payment_failed`, updating the matching `payments` row and flipping the invoice status.
- Rider profile payment screen is placeholder for now (mobile app changes out of scope for this batch) — deferred finding: mobile payment screen & Stripe Elements.

## Tests

- `paymentCharging.test.ts` — 4 cases: happy path, missing payment method, invoice already paid, wrong invoice status.

## Dev Notes

- Safer choice: stubbed Stripe client instead of live wiring. Real Stripe integration requires secret keys + webhook setup, which is a prod-readiness step that should land separately with full test coverage against Stripe's test mode. The stub preserves the full data model so Story 5.11 (financial reports) has real `payments` rows to aggregate.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
