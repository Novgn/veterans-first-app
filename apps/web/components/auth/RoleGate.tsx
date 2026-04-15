// Web RoleGate component (Epic 1.5, Story 1.5.1 skeleton).
//
// Client-side UI gate that renders `children` only when the signed-in
// user's UserRole is in the provided `allowedRoles` list. Mirrors the
// apps/mobile RoleGate API so the two platforms share a mental model.
//
// Adapted from the create-rell-app monolith template. Our role set
// ('rider' | 'driver' | 'family' | 'dispatcher' | 'admin') is disjoint
// rather than hierarchical, so membership is by set inclusion — no
// >= threshold semantics.
//
// Usage in layouts (Story 1.5.3 fills these in):
//   apps/web/app/dispatch/layout.tsx → <RoleGate allowedRoles={['dispatcher','admin']}>
//   apps/web/app/admin/layout.tsx    → <RoleGate allowedRoles="admin">
//   apps/web/app/business/layout.tsx → <RoleGate allowedRoles={['dispatcher','admin']}>
//
// IMPORTANT: UX only. Server components, API route handlers, and
// Supabase RLS enforce real access control.

"use client";

import type { ReactNode } from "react";

import type { UserRole } from "@veterans-first/shared";
import { useRole } from "@/lib/auth/use-role";

export interface RoleGateProps {
  /** Role(s) allowed to see the gated content. Pass a single role or an array. */
  allowedRoles: UserRole | readonly UserRole[];
  children: ReactNode;
  /** Rendered when the user's role is not in `allowedRoles`. Defaults to null. */
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
