// Typed query helpers for veterans-first.
//
// Every helper takes a `db` client as its first argument so callers can
// inject either the server-side singleton (`./client.ts`) or a
// request-scoped client. Keeping the helpers pure makes them trivially
// testable and safe across web + mobile without coupling to a specific
// runtime.
//
// Adapted from the create-rell-app monolith template. Veterans-first
// stores `role` directly on the `users` table (not in a separate
// `user_roles` table), so the helpers wrap our schema rather than
// rell's.

import { eq } from "drizzle-orm";

import type { DbClient } from "./client";
import { type NewUser, type User, users } from "./schema";

export interface UserRoleRow {
  clerkUserId: string;
  role: string; // Constrained at the DB level via role_check.
  updatedAt: Date | null;
}

/**
 * Fetch the user's role by Clerk user ID. Returns `null` if the user
 * has no row yet (e.g. immediately after sign-up but before the user
 * webhook upserts the row).
 */
export async function getUserRoleByClerkId(
  db: DbClient,
  clerkUserId: string
): Promise<UserRoleRow | null> {
  const rows = await db
    .select({
      clerkUserId: users.clerkId,
      role: users.role,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Update a user's role. Throws if no users row exists for the given
 * clerkUserId — call {@link upsertUser} first if you need to create
 * the row in the same flow.
 */
export async function setUserRole(
  db: DbClient,
  clerkUserId: string,
  role: User["role"]
): Promise<UserRoleRow> {
  const now = new Date();
  const rows = await db
    .update(users)
    .set({ role, updatedAt: now })
    .where(eq(users.clerkId, clerkUserId))
    .returning({
      clerkUserId: users.clerkId,
      role: users.role,
      updatedAt: users.updatedAt,
    });
  const result = rows[0];
  if (!result) {
    throw new Error(`setUserRole: no users row for clerkUserId=${clerkUserId}`);
  }
  return result;
}

/**
 * Upsert a user row keyed by Clerk ID. Used by the user account webhook
 * (apps/web/app/api/webhooks/clerk/route.ts) to keep the canonical users
 * table in sync with Clerk's identity store. Idempotent — safe to retry.
 */
export async function upsertUser(db: DbClient, payload: NewUser): Promise<User> {
  const now = new Date();
  const rows = await db
    .insert(users)
    .values({ ...payload, updatedAt: now })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        phone: payload.phone,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        updatedAt: now,
      },
    })
    .returning();
  const result = rows[0];
  if (!result) {
    throw new Error(`upsertUser: insert returned no rows for clerkId=${payload.clerkId}`);
  }
  return result;
}

/**
 * Soft-delete a user (sets deletedAt). The Clerk delete webhook calls
 * this when a user account is removed.
 */
export async function softDeleteUser(db: DbClient, clerkUserId: string): Promise<void> {
  await db.update(users).set({ deletedAt: new Date() }).where(eq(users.clerkId, clerkUserId));
}
