# Story 5.2: Implement Driver Roster Management

**Status:** done

## Story

As an admin, I want to view and manage the driver roster, so I maintain an active, qualified driver fleet (FR42, FR44).

## Acceptance Criteria

1. **Given** an admin navigates to `/admin/drivers`, **Then** they see a paginated list of drivers with name, phone, vehicle info, active/inactive status, and a count of assigned rides in progress.
2. **Given** an admin searches by name or phone, **Then** the list filters server-side to matching drivers.
3. **Given** an admin opens a driver detail page, **Then** they see contact info, vehicle, active status, and ride history (recent 25 completed rides).
4. **Given** an admin clicks "Deactivate" on an active driver, **Then** `driver_profiles.is_active` is set to false, the driver is removed from the assignment pool (existing matchers already filter on `is_active`), and any future-scheduled rides with `driver_id = this driver` have their `driver_id` cleared + `status` returned to `confirmed` for reassignment.
5. **Given** deactivation runs, **Then** an `audit_logs` row is inserted recording the actor, the driver id, and the list of rides touched (append-only).

## Implementation

- New server-rendered admin list page at `apps/web/app/admin/drivers/page.tsx` (replaces the stub). Uses `getServerSupabase` with Clerk JWT so RLS applies.
- Server action `deactivateDriver(driverId)` at `apps/web/lib/admin/deactivateDriver.ts` — uses service role supabase (gated by admin check) to run the transaction, then writes audit log.
- Driver detail at `apps/web/app/admin/drivers/[driverId]/page.tsx` — shows contact, vehicle, ride history, and the deactivation form.
- Reuse the existing `driver_profiles` + `rides` + `users` tables; no schema changes.

## Tests

- `packages/shared/src/utils/driverDeactivation.ts` — pure helper that given a list of future-scheduled ride IDs returns the ride-ID audit payload. `driverDeactivation.test.ts` covers 3 cases: zero rides, one ride, many rides.

## Dev Notes

- Safer choice: deactivation only touches rides with `status IN ('pending','confirmed','assigned','pending_acceptance')` — any ride already `en_route` or `in_progress` is left alone and surfaces in the admin UI as a warning ("can't deactivate: 2 rides still in progress"). This avoids stranding riders mid-trip.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
