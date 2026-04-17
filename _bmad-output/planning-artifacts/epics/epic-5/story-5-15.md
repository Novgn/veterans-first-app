# Story 5.15: Implement System Configuration — Operating Hours

**Status:** done

## Story

As an admin, I want to configure service operating hours per day + holiday closures, so rides are only booked during business hours (FR85).

## Acceptance Criteria

1. **Given** an admin opens `/admin/configuration/operating-hours`, **Then** they see a per-day (Mon–Sun) open/close input and a closures list (one date per line).
2. **Given** the admin submits the form with invalid hours (close before open, non-HH:MM, etc.), **Then** save refuses with a clear error.
3. **Given** the config is saved, **Then** `system_config.operating_hours` reflects the new values and an audit log captures before/after.
4. **Given** a rider tries to book outside operating hours (helper `isWithinOperatingHours(dateIso, config)`), **Then** the helper returns false and the booking flow refuses. (Booking flow integration is deferred — this story exposes the helper.)

## Implementation

- `packages/shared/src/utils/operatingHours.ts` — `parseOperatingHoursForm`, `isWithinOperatingHours`.
- `/admin/configuration/operating-hours/page.tsx`.
- `apps/web/lib/admin/saveOperatingHours.ts` server action.

## Tests

- `operatingHours.test.ts` — 4 cases: parse happy path, close-before-open rejected, closure date rejects booking, day-closed rejects booking.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
