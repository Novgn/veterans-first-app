// RoleGate component for veterans-first mobile app.
//
// Same shape as the web version — wraps children and conditionally
// renders them based on the current user's role. Roles are disjoint
// actor types (rider | driver | family | dispatcher | admin); membership
// is by set inclusion, not >= hierarchy.
//
// UX only. Database-layer RLS is the real security boundary.

import type { ReactNode } from 'react';

import type { UserRole } from '@veterans-first/shared';

import { useRole } from '../../lib/auth/use-role';

export interface RoleGateProps {
  /** Role(s) allowed to see the gated content. Pass a single role or an array. */
  allowedRoles: UserRole | readonly UserRole[];
  children: ReactNode;
  /** Rendered when the user's role is not allowed. Defaults to null. */
  fallback?: ReactNode;
  /**
   * When true, users with no resolved role (e.g. brand-new sign-ups
   * before dispatch assigns a role) are allowed through. Use this on
   * the default landing route group (rider) to avoid blocking new
   * accounts.
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
