// Server-side RBAC helpers for apps/web (Epic 1.5, Story 1.5.1 skeleton).
//
// This file is the draft of the three-tier RBAC pattern borrowed from
// create-rell-app, adapted to the veterans-first UserRole set:
//   'rider' | 'driver' | 'family' | 'dispatcher' | 'admin'
//
// The three enforcement layers are:
//
//   1. Server layer (this file + current-user.ts): read `user_roles` via
//      Drizzle, used inside server components and route handlers.
//   2. Client layer (use-role.ts): hook that fetches the current role
//      from an API endpoint for UI gating only.
//   3. Database layer: Supabase RLS policies using `auth.jwt()->>'sub'`
//      enforce access at the row level. Never trust the other two alone.
//
// Clerk metadata expectations (wired in Story 1.5.4):
//   - publicMetadata: { role: UserRole }
//   - Custom JWT template mirrors `public_metadata.role` into a `role`
//     claim so Supabase RLS policies can inspect it.
//
// Real implementation lands in Story 1.5.4 once `@clerk/nextjs` and the
// shared `getDb` / `getUserRoleByClerkId` helpers are available here.

import type { UserRole } from "@veterans-first/shared";

/**
 * Check whether a specific Clerk user currently has the given role.
 *
 * Placeholder — replaced in Story 1.5.4 with a real Drizzle lookup
 * against `user_roles`. Today it always returns false so the gate
 * denies by default (fail-closed).
 */
export async function hasRole(_clerkUserId: string, _role: UserRole): Promise<boolean> {
  return false;
}

/**
 * Check whether the currently-signed-in user has the given role.
 *
 * Placeholder — replaced in Story 1.5.4 with a real `auth()` + Drizzle
 * lookup. Fail-closed until wired.
 */
export async function currentUserHasRole(_role: UserRole): Promise<boolean> {
  return false;
}

/**
 * Is the given user a dispatcher or admin? Helper for the common
 * operations-staff check used by `app/dispatch/*` and `app/admin/*`
 * layouts.
 */
export async function isOpsStaff(clerkUserId: string): Promise<boolean> {
  return (await hasRole(clerkUserId, "dispatcher")) || (await hasRole(clerkUserId, "admin"));
}
