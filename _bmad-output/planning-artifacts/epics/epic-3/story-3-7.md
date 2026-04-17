# Story 3.7: Implement Driver Availability Schedule

**Status:** done

## Story

As a driver,
I want to set my weekly availability windows,
So that dispatch only offers me rides when I plan to be working.

## Acceptance Criteria

1. **Given** the Schedule tab, the driver sees a list of weekly windows (day + start/end time) with an Add button.
2. **Given** an existing window, **When** the driver toggles the switch, **Then** the `is_active` flag flips (quick pause without deleting).
3. **Given** an existing window, **When** the driver taps delete, **Then** a confirmation prompt appears; on confirm the window is removed.
4. **Given** Add, the driver can pick a day of week and two time buckets (start < end) and save. The new row appears in the list.
5. **Given** `driver_availability` has RLS enabled, **When** a driver queries, **Then** only their rows return; dispatchers/admins see all rows.

## Implementation

- Migration `0020_create_driver_availability.sql` with day/time CHECK constraints + RLS.
- Drizzle schema: `driverAvailability` table + types.
- `apps/mobile/hooks/useDriverAvailability.ts`: query + three mutations (create/update/delete).
- Components (`apps/mobile/components/schedule/`):
  - `AvailabilityRow` (single entry with switch + delete)
  - `AddAvailabilitySheet` (day + start + end pickers)
- Screen: `apps/mobile/app/(driver)/(tabs)/schedule.tsx` (was placeholder).

## Tests

- `AvailabilityRow.test.tsx` (8 cases including `fmtTime` parametric)
- `useDriverAvailability.test.ts` (4 cases covering list/create/update/delete)

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
