# Story 3.12: Implement Admin / Dispatch Console Shell & Navigation

**Status:** done

## Story

As a dispatcher,
I want a single console with a clear sidebar of all my tools,
So that I can switch between the fleet map, assignments, rider database, etc., without hunting through menus.

## Acceptance Criteria

1. **Given** the `/dispatch` section, a left sidebar shows links to every dispatch area (overview, fleet, assignments, phone bookings, riders, confirmations, no-shows, trip logs).
2. **Given** the signed-in user is not a dispatcher/admin, **When** they hit any `/dispatch/*` URL, **Then** they are redirected home.
3. **Given** the current URL, **When** the layout renders, **Then** the matching sidebar link gets the active/aria-current style.
4. **Given** the overview page, counts of pending bookings, active trips, and no-shows-to-review are shown with deep links to each area.

## Implementation

- `apps/web/lib/supabase.ts`: server-side Clerk-aware Supabase client (+ service-role flavor).
- `apps/web/components/shared/SectionNav.tsx`: accessible sidebar nav (URL-active detection via `aria-current`).
- Middleware adds `x-next-pathname` header so server components can compute active state without client JS.
- `/dispatch/layout.tsx` adopts `SectionNav` + existing role guard.
- `/dispatch/page.tsx` replaces placeholder with 3-card overview fed by a Supabase count query.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
