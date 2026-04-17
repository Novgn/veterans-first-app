// Client-side role hook for apps/mobile.
//
// Reads the active role from Clerk's publicMetadata (set by the dispatcher
// or admin via the Clerk dashboard / our user_roles → Clerk sync). For the
// final wiring (JWT template + Supabase user_roles fallback + module-level
// cache), see Story 1.5.4.
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
