// Client-side role hook for apps/web (Epic 1.5, Story 1.5.1 skeleton).
//
// UI-only gate. Fetches the current user's UserRole from the server so
// the <RoleGate> client component can decide whether to render its
// children. Real implementation lands in Story 1.5.4 with:
//
//   - useAuth() from @clerk/nextjs for signed-in state
//   - fetch('/api/me/role') returning { role: UserRole }
//   - module-level cache to dedupe concurrent mounts within a session
//
// Expected response shape (Story 1.5.4):
//   GET /api/me/role → { role: 'rider' | 'driver' | 'family' | 'dispatcher' | 'admin' }
//
// Reminder: client-side role checks are NEVER a security boundary. Real
// access control lives in Supabase RLS and server-side route handlers.

import type { UserRole } from "@veterans-first/shared";

export interface UseRoleResult {
  role: UserRole | null;
  isLoading: boolean;
}

// Placeholder implementation — returns null so the RoleGate renders its
// fallback until Story 1.5.4 wires the real fetch.
export function useRole(): UseRoleResult {
  return { role: null, isLoading: false };
}
