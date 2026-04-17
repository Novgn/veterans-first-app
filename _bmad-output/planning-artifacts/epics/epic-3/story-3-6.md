# Story 3.6: Implement Driver Contact Rider

**Status:** done

## Story

As a driver,
I want to call or text the rider from the active trip screen,
So that I can coordinate pickup details (curb, gate code, etc) without losing the trip context.

## Acceptance Criteria

1. **Given** an active trip with a rider phone number, **When** the driver taps "Contact Rider", **Then** a sheet presents Call and Text options.
2. **Given** iOS, the sheet is the native `ActionSheetIOS`; on Android it is a bottom sheet modal. Both have 48dp+ touch targets.
3. **Given** "Call", the phone app opens with the rider's phone prefilled. **Given** "Text", the SMS app opens with the rider's phone prefilled.
4. **Given** no phone number on file, **When** the driver taps the contact button, **Then** a graceful alert explains the number is unavailable.
5. **Given** accessibility, **When** each option is focused, **Then** the screen reader reads both the action and the rider's first name.

## Implementation

- New `apps/mobile/components/trips/ContactRiderSheet.tsx` mirroring the rider-side `ContactDriverSheet`.
- Active trip screen (`app/(driver)/trips/[id].tsx`) changed "Call Rider" to "Contact Rider" and opens the sheet.
- Shared behavior: `Linking.canOpenURL` guard before `openURL`, fallback Alert if the OS can't open the scheme.

## Tests

- `components/trips/__tests__/ContactRiderSheet.test.tsx` — renders options, opens `tel:` and `sms:` URLs (3 cases).

## Change Log

| Date       | Change                              | Author |
| ---------- | ----------------------------------- | ------ |
| 2026-04-17 | Story authored + implemented (auto) | Claude |
