# Story 3.10: Implement No-Show Handling

**Status:** done

## Story

As a driver,
I want to mark a rider as no-show after waiting at the pickup,
So that dispatch can reassign the slot and the trip is accurately closed.

## Acceptance Criteria

1. **Given** the trip is in `arrived` status, the driver sees a no-show timer counting up from the arrival timestamp.
2. **Given** the wait threshold (default 5 min) hasn't elapsed, the Mark No-Show button is disabled and shows the countdown.
3. **Given** the wait has elapsed, **When** the driver taps Mark No-Show, **Then** a confirmation prompt appears. On confirm, the ride status flips to `no_show` and a `no_show` event is inserted with location.
4. **Given** the db enforces the new status via CHECK constraint, no bad values can leak in.

## Implementation

- Migration `0023_add_no_show_status.sql` extends the `ride_status_check` with `no_show`.
- Hook `useMarkNoShow` writes both the ride status and a ride_event, invalidates trip queries.
- Component `NoShowTimer` (and exported `formatMs` helper) drives the countdown UI.
- Trip detail screen renders the timer only when the trip is `arrived`, uses local `arrivedAt` state set when the status mutation to `arrived` succeeds.

## Tests

- `NoShowTimer.test.tsx` (8 cases: formatter + enabled/disabled + fires callback)
- `useMarkNoShow.test.ts` (2 cases: happy path + ride update failure)

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
