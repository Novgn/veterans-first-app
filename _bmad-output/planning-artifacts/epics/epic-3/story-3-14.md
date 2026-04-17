# Story 3.14: Implement Ride Assignment / Reassignment

**Status:** done

## Story

Dispatcher assigns a driver to a pending ride, or reassigns an existing driver.

## Acceptance Criteria

1. Lists rides in status `pending | confirmed | pending_acceptance | assigned`.
2. Each row has a driver dropdown populated from all users with role=driver.
3. Submitting the form updates `rides.driver_id` + flips status to `assigned`.
4. Reassigning an already-assigned ride works via the same form.

## Implementation

`apps/web/app/dispatch/assignments/page.tsx` — per-ride `<form action={assignRideAction}>` with a Next.js Server Action; `revalidatePath` refreshes the list.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
