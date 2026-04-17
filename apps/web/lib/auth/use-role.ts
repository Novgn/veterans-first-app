'use client';

// Client-side role hook for veterans-first web app.
//
// Fetches the current user's UserRole from `/api/me/role` and returns
// it alongside a loading flag. UI gating only — server components
// (`current-user.ts`, `roles.ts`), route handlers, and Supabase RLS
// enforce real access control.
//
// Cache is keyed by Clerk userId so signing out + signing in as a
// different user invalidates the previous user's cached role.

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

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

interface CacheEntry {
  userId: string;
  role: UserRole | null;
}

let cached: CacheEntry | null = null;
let inFlight: Promise<UserRole | null> | null = null;
let inFlightUserId: string | null = null;

async function fetchRole(userId: string): Promise<UserRole | null> {
  if (cached && cached.userId === userId) return cached.role;
  if (inFlight && inFlightUserId === userId) return inFlight;

  inFlightUserId = userId;
  inFlight = (async () => {
    try {
      const res = await fetch('/api/me/role', { credentials: 'include' });
      if (!res.ok) return null;
      const body = (await res.json()) as { role?: unknown };
      const role = isValidRole(body.role) ? body.role : null;
      cached = { userId, role };
      return role;
    } catch {
      return null;
    } finally {
      inFlight = null;
      inFlightUserId = null;
    }
  })();

  return inFlight;
}

export function useRole(): UseRoleResult {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [fetched, setFetched] = useState<CacheEntry | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      // Sign-out invalidates the previous user's cached role.
      cached = null;
      return;
    }

    let active = true;
    fetchRole(userId).then((role) => {
      if (active) setFetched({ userId, role });
    });

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded) return { role: null, isLoading: true };
  if (!isSignedIn || !userId) return { role: null, isLoading: false };
  if (fetched && fetched.userId === userId) {
    return { role: fetched.role, isLoading: false };
  }
  return { role: null, isLoading: true };
}
