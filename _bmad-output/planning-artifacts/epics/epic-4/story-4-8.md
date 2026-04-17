# Story 4.8: Implement Driver Notifications

**Status:** done

## Story

As a driver, I want to receive notifications about my ride assignments so I know when I have new work.

## Acceptance Criteria

1. **Given** a new ride is assigned to a driver (ride_offers insert), **Then** the driver receives a "New ride assigned" notification with pickup time/location and rider name.
2. **Given** an assigned ride is cancelled, **Then** the driver receives a "Ride cancelled" notification.
3. **Given** an assigned ride is modified (time or location), **Then** the driver receives a "Ride updated" notification indicating what changed.
4. **Given** the driver has push notifications enabled and has registered an Expo push token on their notification_preferences row, **Then** the payload is dispatched via the same `dispatchNotification` helper used for riders.

## Implementation

- New API route `/api/notifications/driver`:
  - POST with `{ type: 'driver_ride_assigned' | 'driver_ride_cancelled' | 'driver_ride_updated', rideId, driverId, changes? }`.
  - Looks up the driver's phone + preferences, the ride, and the rider name; builds message via new `buildDriverRideMessage` helper in shared; dispatches via `dispatchNotification`.
- Shared helpers:
  - `buildDriverRideMessage` in `packages/shared/src/utils/driverRideMessages.ts`.
- Mobile client:
  - `useAcceptRide` and related flows are not the trigger — Dispatch sends these when it offers / cancels / modifies a ride. The existing `/api/notifications/driver` route is idempotent and fires per event.
  - `useRideOffer` (existing) is unchanged — it only reads offers; the dispatcher is the producer.
  - Add `notifyDriverEvent` helper (already stubbed in Story 4.7) — the dispatch UI's assignment mutation now calls it on success.
- Push token capture is deferred (tracked in deferred-findings — needs Expo `getExpoPushTokenAsync` integration at sign-in time).

## Tests

- `driverRideMessages.test.ts` — 3 cases covering assigned, cancelled, updated.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
