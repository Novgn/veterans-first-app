# Story 5.10: Implement Operational Reports

**Status:** done

## Story

As an admin, I want a dashboard of operational metrics — rides per period, on-time rate, no-show rate — so I can monitor fleet health at a glance (FR62).

## Acceptance Criteria

1. **Given** an admin opens `/business/reports/operations`, **Then** they see a metrics panel for a selectable window (today / past 7 days / past 30 days) with total rides, completed rides, no-shows, cancellations, completion rate %, and no-show rate %.
2. **Given** the selected window has zero rides, **Then** the rates show `—` instead of dividing by zero.
3. **Given** the admin drills into the window, **Then** a per-day breakdown table shows the same metrics day-by-day, sorted descending.
4. **Given** the admin clicks "Export CSV", **Then** the per-day breakdown downloads as CSV with injection-safe escaping (reused from Story 5.8).

## Implementation

- `packages/shared/src/utils/operationalMetrics.ts` — `summarizeOperationalRides(rides, referenceDate)` computes totals + rates + a per-day breakdown from raw ride rows (no DB coupling, so the 5 test cases verify the math without mocking supabase).
- `/business/reports/page.tsx` — links to operations + financial reports.
- `/business/reports/operations/page.tsx` — renders the metrics panel + table + CSV link.
- `/api/business/operations.csv/route.ts` — admin-gated CSV export.

## Tests

- `operationalMetrics.test.ts` — 5 cases: empty window, all-completed, mixed statuses, no-show rate math, per-day bucketing.

## Dev Notes

- Safer choice: rates returned as nullable numbers (`number | null`) so the UI can distinguish "no data" from "0%". Dividing by a zero denominator silently yielded `NaN` in an earlier prototype and surfaced as `NaN%` — null is explicit.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
