# Story 4.7: Implement Driver Status Notifications

**Status:** done

## Story

As a rider, I want to receive notifications when my driver's status changes, so I know when to be ready for pickup.

## Acceptance Criteria

1. **Given** a ride transitions to `assigned` (dispatch sets `driver_id`), **Then** the rider receives a "Your driver X has been assigned" notification.
2. **Given** the ride transitions to `en_route`, **Then** the rider receives a "X is on the way" notification.
3. **Given** the ride transitions to `arrived`, **Then** the rider receives a "X has arrived" notification.
4. **Given** the dispatch always flows through the shared `dispatchNotification` helper, **Then** notification_logs rows record every attempt (sent, skipped, or failed) and preference gates are honored.

## Implementation

- Extend the existing `/api/notifications/ride/route.ts` to accept new event types:
  - `driver_assigned` — looks up driver name + rider phone, calls `dispatchNotification`.
  - `driver_en_route`
  - `driver_arrived`
    The route now dispatches through `dispatchNotification` instead of a bare `console.log`, logs via the structured logger, and writes to `notification_logs`.
- `useTripStatus` (mobile) now fires a fire-and-forget POST to the route after a successful status transition, mapping `en_route → driver_en_route` and `arrived → driver_arrived`.
- Ride offer acceptance (`useAcceptRide`) additionally fires `driver_assigned` so the rider knows who's coming. Failure to notify is swallowed so the primary mutation isn't blocked.

## Tests

- `buildDriverStatusMessage.test.ts` (shared) — 3 cases covering the three transitions + driver name fallback.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
