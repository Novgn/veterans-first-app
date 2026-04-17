# Story 3.15: Implement Phone Booking Management

**Status:** done

## Story

Dispatcher creates a ride on behalf of a rider who called in.

## Acceptance Criteria

1. Form selects an existing rider by dropdown (keyed by phone).
2. Pickup + dropoff addresses + scheduled datetime are required.
3. Submit inserts a `rides` row with `status='pending'`.
4. On success the booking appears in Assignments.

## Implementation

`apps/web/app/dispatch/phone-bookings/page.tsx` — server component with form + server action; `revalidatePath` refreshes both this page and `/dispatch/assignments`.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
