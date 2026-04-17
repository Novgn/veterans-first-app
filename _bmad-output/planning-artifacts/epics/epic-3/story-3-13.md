# Story 3.13: Implement Fleet Map View

**Status:** done

## Story

Dispatcher view of every driver currently on an active trip.

## Acceptance Criteria

1. Shows every ride in status `assigned | en_route | arrived | in_progress`.
2. For each, displays driver + rider, current status, pickup/dropoff.
3. Shows the driver's most recent `driver_locations` fix with timestamp.
4. Empty state when no active trips.

## Implementation

`apps/web/app/dispatch/fleet/page.tsx` — server component, two Supabase calls joined in memory (rides → drivers list → locations). Map widget deferred; table is production-useful today.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
