// Client-side role hook for veterans-first mobile app.
//
// Reads the active role from Clerk's publicMetadata (set by the
// dispatcher / admin via the Clerk dashboard / our user account
// webhook). Mobile uses the Clerk Expo SDK; sessionClaims aren't
// directly exposed by `useAuth()`, so we read publicMetadata instead.
//
// UX gating only. Supabase RLS is the real security boundary.

import { useAuth, useUser } from '@clerk/clerk-expo';

import type { UserRole } from '@veterans-first/shared';

export interface UseRoleResult {
  role: UserRole | null;
  isLoading: boolean;
}

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

export function useRole(): UseRoleResult {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  if (!authLoaded || !userLoaded) {
    return { role: null, isLoading: true };
  }

  if (!isSignedIn || !user) {
    return { role: null, isLoading: false };
  }

  const candidate = user.publicMetadata?.role;
  return { role: isValidRole(candidate) ? candidate : null, isLoading: false };
}
