/**
 * Role extraction for the Clerk user-lifecycle webhook.
 *
 * Clerk's public_metadata.role is the source of truth for staff roles
 * (set by invitations and the admin console). The webhook mirrors it
 * into the users table — but only when the payload carries a valid
 * role. Returning null tells the caller to leave the stored role
 * untouched (update) or fall back to the 'rider' default (insert),
 * so a metadata-less user.updated event can never stomp a role that
 * was assigned elsewhere.
 */

import type { UserRole } from "../types";

const VALID_ROLES: readonly UserRole[] = ["rider", "driver", "family", "dispatcher", "admin"];

export function resolveWebhookRole(publicMetadata: unknown): UserRole | null {
  if (!publicMetadata || typeof publicMetadata !== "object") return null;
  const role = (publicMetadata as Record<string, unknown>).role;
  if (typeof role === "string" && (VALID_ROLES as readonly string[]).includes(role)) {
    return role as UserRole;
  }
  return null;
}
