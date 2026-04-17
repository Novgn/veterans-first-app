# Story 3.11: Implement Driver Profile Management

**Status:** done

## Story

As a driver,
I want to view and update my personal and vehicle info,
So that riders and dispatch always see accurate details.

## Acceptance Criteria

1. **Given** the Profile tab, the driver sees personal info (name, phone, email, photo) plus vehicle info (make/model/year/color/plate) + bio + years driving.
2. **Given** the driver taps Edit Profile, a bottom-sheet form loads the current values.
3. **Given** the driver submits, both `users` and `driver_profiles` tables are updated (required fields validated client-side first).
4. **Given** a required field is blanked out, **Then** a clear alert explains which field needs to be filled before saving.

## Implementation

- `useDriverProfile` + `useUpdateDriverProfile` (composed read/write across `users` + `driver_profiles`).
- `EditDriverProfileSheet` + exported `validateDriverProfileForm` for unit-testable validation.
- Replace placeholder profile tab with the full view + edit flow.

## Tests

- `EditDriverProfileSheet.test.tsx` (4 cases covering the validator's accept + reject paths).

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
