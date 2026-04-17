// Server-side helper that resolves the current Clerk user and their
// UserRole in one call.
//
// Read order (cheapest → most expensive):
//   1. sessionClaims.role  — populated by Clerk's JWT template that mirrors
//      `public_metadata.role`. No Clerk API call.
//   2. publicMetadata.role — fetched via Clerk's currentUser(). One API call,
//      cached per request via React's cache().
//
// The DB column `users.role` (see packages/shared/src/db/schema.ts) is the
// canonical write target; Clerk's publicMetadata mirrors it via the user
// account webhook (Story 5.16). For row-level enforcement, see Supabase
// RLS policies — never trust this helper alone.

import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

import type { UserRole } from "@veterans-first/shared";

export interface CurrentUserWithRole {
  clerkUserId: string;
  role: UserRole;
}

const VALID_ROLES: readonly UserRole[] = [
  "rider",
  "driver",
  "family",
  "dispatcher",
  "admin",
] as const;

function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

function extractRoleFromClaims(
  claims: Record<string, unknown> | null | undefined
): UserRole | null {
  if (!claims) return null;
  const direct = claims.role;
  if (isValidRole(direct)) return direct;
  const meta = claims.publicMetadata;
  if (meta && typeof meta === "object" && "role" in meta) {
    const nested = (meta as Record<string, unknown>).role;
    if (isValidRole(nested)) return nested;
  }
  return null;
}

/**
 * Resolve the current Clerk user and their UserRole.
 *
 * Returns `null` for unauthenticated callers, or for signed-in users whose
 * role hasn't been assigned. Wrapped in React's cache() so concurrent server
 * components within a single request share one resolution.
 */
export const getCurrentUserWithRole = cache(async (): Promise<CurrentUserWithRole | null> => {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  // Fast path: JWT claim from the Clerk JWT template.
  const claimRole = extractRoleFromClaims(sessionClaims as Record<string, unknown> | null);
  if (claimRole) {
    return { clerkUserId: userId, role: claimRole };
  }

  // Slow path: hit Clerk API for publicMetadata.
  const user = await currentUser();
  const metaRole = user?.publicMetadata?.role;
  if (isValidRole(metaRole)) {
    return { clerkUserId: userId, role: metaRole };
  }

  return null;
});
