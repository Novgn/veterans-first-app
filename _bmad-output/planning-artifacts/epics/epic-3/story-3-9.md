# Story 3.9: Implement Photo Arrival Confirmation

**Status:** done

## Story

As a driver,
I want to snap a photo when I arrive at pickup,
So that the rider/family/dispatch has visual proof of a safe arrival.

## Acceptance Criteria

1. **Given** the driver transitions to `arrived`, **When** location capture completes, **Then** the camera optionally launches for a confirmation photo.
2. **Given** the driver takes a photo, **When** the upload succeeds, **Then** the ride_event row carries the photo URL.
3. **Given** the driver cancels or the upload fails, **Then** the trip still transitions to `arrived` (photo is best-effort).
4. **Given** the photo is stored in the `ride-photos` Supabase bucket, **Then** the public URL is retrievable by anyone with access to the ride event (RLS-restricted).

## Implementation

- Migration `0022_add_ride_event_photo.sql` adds `photo_url` to `ride_events`.
- Drizzle schema adds `photoUrl`.
- New hook `useArrivalPhotoUpload` encapsulates permission + capture + resize + upload (handles `expo-image-picker` + `expo-image-manipulator`).
- `useTripStatus` now accepts `photoUrl` and writes it with the event row.
- Trip detail screen calls `capturePhoto(trip.id)` on the `arrived` transition and passes the returned URL (or null) into the status mutation. Capture failures don't block the transition.

## Tests

- Existing useTripStatus tests updated to verify `photo_url` reaches the insert (no regressions).
- Manual: camera capture flow covered by the existing expo-image-picker patterns from Story 2.12.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
