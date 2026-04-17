# Story 5.16: Implement User Account Management

**Status:** done

## Story

As an admin, I want to invite dispatchers/admins, change their roles, and reset passwords, so the right people have the right access (FR86, FR87).

## Acceptance Criteria

1. **Given** an admin opens `/admin/users`, **Then** they see a list of every user with `role IN ('admin', 'dispatcher')` including name, email, role, and status (active/pending/deactivated).
2. **Given** an admin clicks "Invite user", **Then** they can enter email + role (admin | dispatcher), and the system creates a Clerk invitation with `publicMetadata.role` set to the chosen role. An audit log entry records the actor, email, and role.
3. **Given** an admin changes an existing user's role, **Then** Clerk's publicMetadata is updated AND the local `users.role` column is updated. An audit log entry records before/after.
4. **Given** an admin resets a user's password, **Then** Clerk sends a password-reset email and an audit log entry records the action.

## Implementation

- `packages/shared/src/utils/userManagement.ts` — pure `validateInviteInput({ email, role })` (4 cases).
- `/admin/users/page.tsx` — lists admin/dispatcher users from both Clerk + users table (join on clerk_id).
- `/admin/users/invite/page.tsx` — invite form.
- `apps/web/lib/admin/userActions.ts` — three server actions:
  - `inviteStaffUser(formData)` — Clerk invitation + audit log.
  - `changeUserRole(formData)` — Clerk metadata + users row + audit log.
  - `resetUserPassword(formData)` — Clerk reset + audit log.

## Tests

- `userManagement.test.ts` — 4 cases: valid invite, missing email, invalid email, role not allowed.

## Dev Notes

- Safer choice: role changes and password resets go through Clerk's admin API (clerkClient) rather than poking Supabase only — Clerk is the source of truth for authentication, and divergence between Clerk metadata and `users.role` causes RLS mismatches. The webhook already hydrates the users row on Clerk metadata change, so the server action updates Clerk first, then mirrors to the users table for RLS to see immediately.
- Only `admin` and `dispatcher` roles are allowed here — rider/driver/family invitations live elsewhere (Story 5.3 for drivers; riders self-register via SMS auth).

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
