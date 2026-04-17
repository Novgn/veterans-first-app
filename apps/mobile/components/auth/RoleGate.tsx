// Mobile RoleGate component (Epic 1.5, Story 1.5.1 skeleton).
//
// Wraps children and conditionally renders them based on the current
// user's Clerk-backed role. Adapted from the create-rell-app monolith
// template to use the veterans-first UserRole set (rider | driver |
// family | dispatcher | admin) rather than rell's free/paid/super_admin
// hierarchy — our roles are disjoint, not nested, so membership is by
// equality or an explicit `allowedRoles` list, not a >= threshold.
//
// UX only. Supabase RLS enforces the real security boundary.

import type { ReactNode } from 'react';

import type { UserRole } from '@veterans-first/shared';
import { useRole } from '../../lib/auth/use-role';

export interface RoleGateProps {
  /** Role(s) allowed to see the gated content. Pass a single role or an array. */
  allowedRoles: UserRole | readonly UserRole[];
  children: ReactNode;
  /** Rendered when the user's role is not in `allowedRoles`. Defaults to null. */
  fallback?: ReactNode;
  /**
   * When true, users with no resolved role (e.g. brand-new sign-ups before
   * dispatch assigns a role) are allowed through. Use this on the default
   * landing route group (rider) to avoid blocking new accounts.
   */
  allowUnresolvedRole?: boolean;
}

export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
  allowUnresolvedRole = false,
}: RoleGateProps) {
  const { role, isLoading } = useRole();

  if (isLoading) return null;

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles as UserRole];
  if (role != null && allowed.includes(role)) {
    return <>{children}</>;
  }

  if (role == null && allowUnresolvedRole) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
