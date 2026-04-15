// Server-side helper that resolves the current Clerk user and their
// UserRole in one call (Epic 1.5, Story 1.5.1 skeleton).
//
// Adapted from create-rell-app's `current-user.ts` pattern. The DB row
// in `user_roles` is the canonical source of truth for role assignment;
// the Clerk webhook keeps it in sync on sign-up / role change.
//
// Real implementation lands in Story 1.5.4 once Clerk + Drizzle are
// wired into apps/web.

import type { UserRole } from "@veterans-first/shared";

export interface CurrentUserWithRole {
  clerkUserId: string;
  role: UserRole;
}

/**
 * Resolve the current Clerk user and their UserRole.
 *
 * Returns `null` for unauthenticated callers. For signed-in users with
 * no row in `user_roles`, the final implementation will default to
 * 'rider' (the most restrictive non-staff role) and log a warning — a
 * missing row indicates the webhook has not yet populated it.
 *
 * Placeholder — Story 1.5.4 replaces with the real `auth()` + Drizzle
 * query wrapped in React's cache() for request-scoped dedupe.
 */
export async function getCurrentUserWithRole(): Promise<CurrentUserWithRole | null> {
  return null;
}
