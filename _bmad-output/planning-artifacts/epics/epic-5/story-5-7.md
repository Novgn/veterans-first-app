# Story 5.7: Implement Payment Account Management

**Status:** done

## Story

As an admin, I want to view a rider's billing summary and apply credits or waive fees, so billing issues resolve without support friction (FR60).

## Acceptance Criteria

1. **Given** an admin opens `/business/billing/riders`, **Then** they see a paginated list of riders with outstanding balance, last payment date, and autopay status.
2. **Given** an admin drills into a rider, **Then** they see payment methods (masked), invoice history, payment history, current credit balance, and billing frequency.
3. **Given** an admin applies a credit, **When** the form submits, **Then** `rider_payment_accounts.credit_balance_cents` increases by the credit amount and an audit log entry records actor, rider, amount, and reason.
4. **Given** an admin waives a pending invoice, **Then** the invoice status moves to `cancelled`, an audit log entry is written, and the invoice detail page shows the waive reason.

## Implementation

- `/business/billing/riders/page.tsx` — list page.
- `/business/billing/riders/[riderId]/page.tsx` — drill-in with two admin actions (apply credit + waive invoice) rendered as server-action forms.
- `apps/web/lib/billing/riderAccount.ts` — two server actions:
  - `applyRiderCredit(formData)` → writes credit + audit log.
  - `waiveInvoice(formData)` → cancels invoice + audit log.
- Both admin-gated via `getCurrentUserWithRole` (fail-closed).

## Tests

- `packages/shared/src/utils/creditAdjustment.ts` — pure helper computing the next balance (preventing negative adjustments from going below zero). `creditAdjustment.test.ts` covers positive credit, credit use on a bill, floor at zero, negative input rejection.

## Dev Notes

- Safer choice: credit adjustments are additive only in the UI (admins pick a positive number and a type of adjustment: credit | refund). Internal math supports negative deltas for the consume-credit path, but the admin form rejects them to avoid accidentally draining a rider's balance.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
