// Client-side role hook for apps/mobile (Epic 1.5, Story 1.5.1 skeleton).
//
// This is a placeholder wired in Story 1.5.4, when Clerk + Supabase are
// plumbed into the consolidated mobile app. The final implementation will
// follow the create-rell-app monolith pattern:
//
//   1. useAuth() from @clerk/clerk-expo resolves the signed-in user.
//   2. A Clerk-authenticated Supabase client queries `user_roles` for the
//      user's `UserRole` ('rider' | 'driver' | 'family' | 'dispatcher' |
//      'admin'). RLS policy `select_user_roles_own` permits the self-read.
//   3. A module-level cache dedupes concurrent <RoleGate> mounts within a
//      session; the cache is cleared on sign-out.
//
// Expected Clerk metadata shape (see Story 1.5.4):
//   publicMetadata: { role: UserRole }
// with the DB row in `user_roles` as the canonical source of truth and
// Clerk's JWT template forwarding the role claim for RLS.
//
// UX gating only. Supabase RLS is the real security boundary.

import type { UserRole } from "@veterans-first/shared";

export interface UseRoleResult {
  role: UserRole | null;
  isLoading: boolean;
}

// Placeholder implementation — Story 1.5.4 replaces with a real Clerk +
// Supabase lookup. Returning { role: null, isLoading: false } keeps the
// RoleGate component inert until the app is wired up.
export function useRole(): UseRoleResult {
  return { role: null, isLoading: false };
}
