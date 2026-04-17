# Story 3.19: Implement Trip Documentation & Mileage Tracking

**Status:** done

## Story

Dispatch and ops need a daily trip log with mileage and fare for payroll / compliance.

## Acceptance Criteria

1. Lists the most recent 100 `completed` trips.
2. Shows timestamp, driver, rider, route, estimated miles, fare.
3. Mileage is estimated from the ordered GPS events recorded during the trip (Story 3.4).
4. Fare comes from `rides.fare_cents` (Story 3.8).

## Implementation

- `apps/web/app/dispatch/trip-logs/page.tsx` — nested select on `ride_events`, haversine mileage estimator.
- `estimateMilesFromEvents` exported for future unit testing.
- No new DB objects needed — reuses fields added in Stories 3.4/3.8/3.9.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
