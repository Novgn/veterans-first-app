import 'server-only';

// Server-side RBAC helpers for veterans-first web app.
//
// Three-tier enforcement (defense in depth):
//
//   1. Server layer (this file + current-user.ts): role check inside
//      server components and route handlers.
//   2. Client layer (use-role.ts): UI gating hook. Never the security
//      boundary.
//   3. Database layer: Supabase RLS policies using
//      `auth.jwt()->>'sub'` enforce access at the row level.
//
// Clerk metadata model:
//   - users.role (Drizzle, see packages/shared/src/db/schema.ts) is the
//     canonical source of truth.
//   - Clerk publicMetadata.role mirrors it via the user account webhook
//     (apps/web/app/api/webhooks/clerk/route.ts).
//   - Clerk JWT template projects publicMetadata.role into a `role`
//     session claim so Supabase RLS policies can inspect it without an
//     extra DB hit.

import { auth, clerkClient } from '@clerk/nextjs/server';

import type { UserRole } from '@veterans-first/shared';

import { getCurrentUserWithRole } from './current-user';

const VALID_ROLES: readonly UserRole[] = [
  'rider',
  'driver',
  'family',
  'dispatcher',
  'admin',
] as const;

function isValidRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (VALID_ROLES as readonly string[]).includes(value);
}

/**
 * Check whether a specific Clerk user has the given role.
 *
 * Hits Clerk's user API. Use sparingly — for the current session,
 * prefer {@link currentUserHasRole} which uses the cached
 * `getCurrentUserWithRole`.
 */
export async function hasRole(clerkUserId: string, role: UserRole): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    const candidate = user.publicMetadata?.role;
    return isValidRole(candidate) && candidate === role;
  } catch {
    return false; // fail closed
  }
}

/**
 * Check whether the currently-signed-in user has the given role.
 */
export async function currentUserHasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === role;
}

/**
 * Is the given user a dispatcher or admin? Helper for the common
 * operations-staff check used by `app/dispatch/*` and `app/admin/*`
 * layouts.
 */
export async function isOpsStaff(clerkUserId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    const candidate = user.publicMetadata?.role;
    return candidate === 'dispatcher' || candidate === 'admin';
  } catch {
    return false;
  }
}

/**
 * Is the currently-signed-in user a dispatcher or admin?
 */
export async function currentUserIsOpsStaff(): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === 'dispatcher' || user?.role === 'admin';
}

/**
 * Read the current session's Clerk userId without role resolution.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
