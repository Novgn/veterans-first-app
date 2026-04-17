# Story 5.14: Implement System Configuration — Pricing

**Status:** done

## Story

As an admin, I want to configure ride pricing parameters and see the effective fare for a sample ride, so rate changes are deliberate (FR84).

## Acceptance Criteria

1. **Given** an admin opens `/admin/configuration/pricing`, **Then** they see the current base rate, per-mile rate, per-wait-minute rate, included wait minutes, and minimum fare — each as an editable numeric input in dollars.
2. **Given** the admin saves new values, **Then** `system_config` row `pricing` is updated, an audit log entry captures before/after, and the "sample ride" preview on the same page recalculates.
3. **Given** negative or non-numeric values are entered, **Then** the save action refuses and surfaces a clear error.
4. **Given** `computeRideFareCents(input, pricing)` is invoked (e.g. from the booking flow), **Then** it returns `max(minimumFare, base + mile*miles + wait*maxWait0)` where `wait*maxWait0 = max(0, waitMinutes − included)` multiplied by perWaitMinute.

## Implementation

- `packages/shared/src/utils/pricing.ts` — pure types + `computeRideFareCents`.
- `/admin/configuration/pricing/page.tsx`.
- `apps/web/lib/admin/savePricing.ts` server action.

## Tests

- `pricing.test.ts` — 4 cases: base+mile only, wait overage, minimum-fare floor, included-wait-covers-wait.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
