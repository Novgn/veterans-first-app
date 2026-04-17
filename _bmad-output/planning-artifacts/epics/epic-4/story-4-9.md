# Story 4.9: Implement Family Pickup Notifications

**Status:** done

## Story

As a family member, I want to receive automatic notifications when my loved one is picked up, so I know their ride has started.

## Acceptance Criteria

1. **Given** a rider's ride transitions to `in_progress` (trip started), **Then** every approved family member with `permissions.receive_notifications = true` on the link gets a "[Rider] was picked up by [Driver]" notification.
2. **Given** a family member has push or sms disabled in their notification_preferences, **Then** those channels are skipped (existing `dispatchNotification` gate).
3. **Given** the rider has no approved family links, **Then** the endpoint is a no-op (returns 0 dispatched).
4. **Given** the rider-side trip status endpoint is the trigger, **Then** the existing `/api/notifications/ride` route fans the pickup event out to each family member in addition to notifying the rider.

## Implementation

- Shared helper `buildFamilyPickupMessage` — builds the family notification copy given rider + driver first names and pickup location.
- Extend `/api/notifications/ride` to accept a new event `ride_in_progress` that:
  1. Looks up the ride's rider + driver.
  2. Queries `family_links` where `rider_id = ride.rider_id`, `status = 'approved'`, and `permissions->>'receive_notifications' = 'true'`.
  3. Dispatches `family_pickup` notifications to each family member.
- Mobile: `useTripStatus` now fires the `ride_in_progress` event after the driver transitions to `in_progress`.

## Tests

- `familyMessages.test.ts` — 2 cases covering pickup copy with/without driver name.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
