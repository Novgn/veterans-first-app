/**
 * Staff user management validation — Story 5.16
 *
 * Only admin + dispatcher invitations go through the admin console;
 * rider/driver/family accounts are created elsewhere (Story 5.3 for
 * drivers, phone auth for riders).
 */

export const INVITABLE_ROLES = ["admin", "dispatcher"] as const;
export type InvitableRole = (typeof INVITABLE_ROLES)[number];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteValidationResult =
  | { ok: true; email: string; role: InvitableRole }
  | { ok: false; reason: string; field?: "email" | "role" };

export function validateInviteInput(input: {
  email: string;
  role: string;
}): InviteValidationResult {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, reason: "email-required", field: "email" };
  if (!EMAIL_REGEX.test(email)) return { ok: false, reason: "email-invalid", field: "email" };
  if (!(INVITABLE_ROLES as readonly string[]).includes(input.role)) {
    return { ok: false, reason: "role-not-allowed", field: "role" };
  }
  return { ok: true, email, role: input.role as InvitableRole };
}
