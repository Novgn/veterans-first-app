'use client';

// RoleGate component for veterans-first web app.
//
// Client-side UI gate that renders `children` only when the signed-in
// user's role is in the `allowedRoles` set. Roles in this app are
// disjoint actor types (rider | driver | family | dispatcher | admin),
// not a hierarchy — so membership is by set inclusion, not >= threshold.
//
// IMPORTANT: this is UX only. Server-side layouts (apps/web/app/{dispatch,
// admin,business}/layout.tsx) and Supabase RLS policies are the real
// access controls. A user who bypasses this component still can't read
// rows they don't have a claim on.

import type { ReactNode } from 'react';

import type { UserRole } from '@veterans-first/shared';

import { useRole } from '@/lib/auth/use-role';

export interface RoleGateProps {
  /** Role(s) allowed to see the gated content. Pass a single role or an array. */
  allowedRoles: UserRole | readonly UserRole[];
  children: ReactNode;
  /** Rendered when the user's role is not allowed. Defaults to null. */
  fallback?: ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { role, isLoading } = useRole();

  // Don't flash gated content while resolving.
  if (isLoading) return null;

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles as UserRole];
  if (role != null && allowed.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
