# Story 5.3: Implement Driver Onboarding

**Status:** done

## Story

As an admin, I want to onboard new drivers with their contact info, vehicle, and credentials in one flow, so only qualified drivers reach the assignment pool (FR43).

## Acceptance Criteria

1. **Given** an admin clicks "Add Driver" on the roster page, **Then** they land on `/admin/drivers/new` with a form for personal info (first/last name, phone, email), vehicle info (make, model, year, color, plate), and optional credential document URLs for license + insurance + background check.
2. **Given** the admin submits a valid form, **Then** the system creates a Clerk user invitation (role=driver), a `users` row linked to the new Clerk user (after invitation acceptance, the existing webhook hydrates the record), a `driver_profiles` row with `is_active=false` until credentials are verified, and `driver_credentials` rows for each credential type (status=`pending`).
3. **Given** onboarding data fails validation, **Then** the admin stays on the page with a clear error message, no partial user/driver record is created.
4. **Given** a Clerk invitation creation fails (e.g., phone already in use), **Then** the action surfaces the error and does not create any DB rows.

## Implementation

- Migration `0029_create_driver_credentials.sql` creates `driver_credentials` table (also covers Story 5.9). Story 5.3 only writes initial pending rows; Story 5.9 adds expiration + verification.
- Schema addition in `packages/shared/src/db/schema.ts` with typed exports.
- `/admin/drivers/new/page.tsx` — server-rendered form using native HTML inputs (no client state library needed).
- Server action `createDriverOnboarding` at `apps/web/lib/admin/createDriverOnboarding.ts`:
  - Validates inputs with zod.
  - Calls Clerk `users.createUser` (signInCreator, sets publicMetadata.role=driver).
  - Inserts `users` row (service role supabase, since the Clerk webhook is async; idempotent on clerk_id upsert).
  - Inserts `driver_profiles` row with `is_active=false`.
  - Inserts `driver_credentials` rows for each credential URL provided.
  - Writes audit_log entry.

## Tests

- `packages/shared/src/utils/driverOnboarding.ts` + `.test.ts` — pure validator covering required fields, E.164 phone normalization, and credential URL shape. 4 cases.

## Dev Notes

- Safer choice: `is_active=false` until credentials are verified. Story 5.9 flips active when all required credentials hit `verified`. This prevents brand-new drivers showing up in the dispatcher queue before their background check clears.
- Welcome SMS/email is deferred: Clerk's invitation email covers login. A welcome SMS was logged in deferred-findings (it needs Twilio wiring from Story 4 that's also still stubbed).

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
