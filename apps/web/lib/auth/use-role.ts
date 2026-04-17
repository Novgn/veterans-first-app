// Client-side role hook for apps/web.
//
// Fetches the current user's UserRole from `/api/me/role` so the client
// `<RoleGate>` can decide whether to render children. UI-only — server
// components and Supabase RLS enforce real access control.

"use client";

import { useEffect, useState } from "react";

import type { UserRole } from "@veterans-first/shared";

export interface UseRoleResult {
  role: UserRole | null;
  isLoading: boolean;
}

const VALID_ROLES: readonly UserRole[] = [
  "rider",
  "driver",
  "family",
  "dispatcher",
  "admin",
] as const;

function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && (VALID_ROLES as readonly string[]).includes(value);
}

// Module-level in-flight promise so concurrent <RoleGate> mounts share a
// single network round-trip per session. Cleared on sign-out by the
// AuthHeader's UserButton afterSignOutUrl flow (full page reload resets
// module state).
let inFlight: Promise<UserRole | null> | null = null;
let cached: UserRole | null | undefined = undefined;

async function fetchRole(): Promise<UserRole | null> {
  if (cached !== undefined) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const res = await fetch("/api/me/role", { credentials: "include" });
      if (!res.ok) return null;
      const body = (await res.json()) as { role?: unknown };
      const role = isValidRole(body.role) ? body.role : null;
      cached = role;
      return role;
    } catch {
      return null;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function useRole(): UseRoleResult {
  const [state, setState] = useState<UseRoleResult>(() => {
    if (cached !== undefined) {
      return { role: cached, isLoading: false };
    }
    return { role: null, isLoading: true };
  });

  useEffect(() => {
    // If the cache filled between render and effect (rare), fetchRole's
    // fast-path returns immediately, so this stays one async tick.
    let active = true;
    fetchRole().then((role) => {
      if (active) setState({ role, isLoading: false });
    });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
