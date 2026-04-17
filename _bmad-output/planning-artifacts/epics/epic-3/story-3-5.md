# Story 3.5: Implement Integrated Navigation

**Status:** done

## Story

As a driver,
I want to launch turn-by-turn navigation to the pickup or dropoff address with one tap,
So that I can get to my rider safely without manually copying the address into another app.

## Acceptance Criteria

1. **Given** an assigned/active trip, **When** the driver taps "Navigate to Pickup"/"Navigate to Dropoff", **Then** the platform's native maps app opens with directions prefilled.
2. **Given** the trip is before `arrived`, the navigation target is the pickup address; after `arrived` (rider in vehicle), the target is the dropoff address.
3. **Given** Apple Maps (iOS) or Google Maps (Android/web) is the preferred provider, **When** the platform can't launch the deep link, **Then** the UI falls back to a generic `https://www.google.com/maps/dir/?api=1&destination=...` URL.
4. **Given** accessibility requirements, **When** the button is focused, **Then** the screen reader announces both the action and the destination address.
5. **And** the navigation button sits next to the status action so Dave can see his next ride step and his driving step together without scrolling.

## Technical Notes

- Pure utility (no DB, no new migrations).
- Provider pick: iOS → `maps://?daddr=...`; everything else → `comgooglemaps://?daddr=...` with https fallback.
- Address passed raw; provider resolves to lat/lng. If coords are already known we prefer them.

## Dev Notes / Implementation

- Added `apps/mobile/lib/navigationUrl.ts` with `buildNavigationUrl(address, coords?)` + Platform selection.
- Added `apps/mobile/components/trips/NavigationButton.tsx` — styled secondary button reusing NativeWind conventions.
- Trip detail (`app/(driver)/trips/[id].tsx`) renders the button in a row above the sticky status action. The target switches based on `trip.status`:
  - `assigned | en_route | arrived` → pickup address
  - `in_progress` → dropoff address
- Placeholder map block removed (now replaced by the real navigation handoff). Story 3.5 is closed.

## Tests

- `lib/__tests__/navigationUrl.test.ts` — URL shape per platform & fallback semantics (5 cases).
- `components/trips/__tests__/NavigationButton.test.tsx` — renders correct destination label + invokes Linking.openURL (3 cases).

## Change Log

| Date       | Change                                             | Author |
| ---------- | -------------------------------------------------- | ------ |
| 2026-04-17 | Story file authored & implemented in full-auto run | Claude |
