# Story 4.10: Implement Family Arrival Notifications with Photo

**Status:** done

## Story

As a family member, I want to receive a notification with a photo when my loved one arrives safely, so I have visual confirmation and peace of mind.

## Acceptance Criteria

1. **Given** a ride completes with an arrival photo captured via Story 3.9, **Then** approved family members (with `permissions.receive_notifications = true` AND `arrival_photos_enabled = true`) receive the arrival notification.
2. **Given** the arrival notification, **Then** the payload carries the full-resolution photo URL so the mobile client can show the photo in-app.
3. **Given** a ride completes without a photo, **Then** the arrival notification is still sent but the copy omits the photo reference and no image URL is attached.
4. **Given** a family member taps the notification, **Then** they land on the family-side ride detail screen (Story 4.3) which already renders the arrival photo.

## Implementation

- Extend the `ride_completed` fan-out (Story 4.9): look up the most recent `ride_events` row with `event_type = 'arrived'` AND `photo_url IS NOT NULL` for the ride; pass the photo URL to `buildFamilyArrivalMessage` and include it as `imageUrl` on the dispatch payload.
- `dispatchNotification` already threads `imageUrl` — extend the stubbed push transport to log it so the eventual Expo Push wiring picks it up.
- `NotificationPayload.imageUrl` is persisted by appending `\nphoto:<url>` to `notification_logs.content` so the mobile client can parse it out on history display. (Short-term pattern — a structured `metadata jsonb` column is tracked in deferred findings.)
- Mobile: `FamilyNotificationCard` component renders the photo thumbnail in the notification list — present for visual polish but tied into existing ride detail navigation (Story 4.3).

## Tests

- `familyMessages.test.ts` already covers arrival with/without photo copy.
- `familyArrivalPhoto.test.ts` (shared) — 2 cases: extracts photo URL from ride_events input, handles missing photo.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
