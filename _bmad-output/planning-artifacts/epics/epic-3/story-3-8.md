# Story 3.8: Implement Driver Earnings Dashboard

**Status:** done

## Story

As a driver,
I want a clear view of what I've earned today, this week, this month, and all-time,
So that I can track progress against my income goals.

## Acceptance Criteria

1. **Given** completed rides have `fare_cents` recorded, the dashboard shows four totals: Today, This Week (Mon-start), This Month, All Time.
2. **Given** a status transition to `completed`, **Then** a DB trigger stamps `completed_at` (if not already set).
3. **Given** the driver has recent completed trips, **When** they open Earnings, **Then** up to 10 recent trips are shown (date, fare, pickup→dropoff).
4. **Given** no completed rides, **When** the driver opens Earnings, **Then** a friendly empty state is shown.

## Implementation

- Migration `0021_add_ride_fare_and_completed_at.sql`: adds `fare_cents`, `completed_at`, completion trigger, composite index.
- Drizzle: adds `fareCents`, `completedAt` to `rides`.
- `useDriverEarnings` + pure `aggregateEarnings` function (testable without DB).
- `formatMoneyCents` helper for UI.
- `apps/mobile/app/(driver)/(tabs)/earnings.tsx` shows stats + recent trips.

## Tests

- `useDriverEarnings.test.ts` — 8 cases covering formatting, bucketing, missing `completed_at`, top-N recent.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
