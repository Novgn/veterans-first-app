# Story 1.5.4: Configure Clerk Role Claims & Tighten Role-Gate Guards

Status: done

## Story

As an architect,
I want Clerk role claims plumbed end-to-end (sessionClaims → publicMetadata fallback) on both apps/mobile and apps/web, with route guards that consume the live role rather than 1.5.1's placeholder,
So that the role-gated monolith from Stories 1.5.2 and 1.5.3 actually enforces access correctly without requiring a Supabase round-trip on every request.

## Acceptance Criteria

1. **Given** a signed-in Clerk user whose JWT claims include `role`, **When** any role gate (mobile `RoleGate` / web layout `getCurrentUserWithRole()`) runs, **Then**:
   - The role is read from `sessionClaims.role` first (cheapest path — no Clerk API call)
   - Fallback: `user.publicMetadata.role` (Clerk API call, cached per request)
   - If neither resolves to a valid `UserRole`, the gate denies (mobile shows fallback; web layout redirects to `/`)

2. **Given** the web app, **When** `getCurrentUserWithRole()` is called, **Then**:
   - The function uses `@clerk/nextjs/server`'s `auth()` to read sessionClaims
   - The function is wrapped in React's `cache()` so concurrent server-component calls within a request dedupe
   - Server-side helpers `hasRole(clerkUserId, role)` and `currentUserHasRole(role)` are wired against Clerk's `clerkClient()` (no DB hit)
   - `isOpsStaff(clerkUserId)` works for both dispatcher and admin

3. **Given** the web app's client tier, **When** a `<RoleGate>` mounts, **Then**:
   - The client hook `useRole()` calls a new route handler `GET /api/me/role` that returns `{ role: UserRole | null }` (server-side resolution via `getCurrentUserWithRole`)
   - The hook caches the result for the session (module-level memo) so multiple `<RoleGate>` mounts share one fetch
   - On error or missing role, returns `{ role: null, isLoading: false }` so the gate's fallback renders

4. **Given** the mobile app, **When** `useRole()` runs, **Then**:
   - Reads role from `user.publicMetadata.role` (already wired in Story 1.5.2)
   - When publicMetadata.role is missing but the user has unsaved sessionClaims, falls back to that
   - Returns `null` for any unrecognized value (denies by default)

5. **Given** the build pipeline, **When** `next build` runs without a real Clerk/DB env, **Then**:
   - `apps/web/app/page.tsx` (the only page that calls `getCurrentUserWithRole` at the top level) is marked `dynamic = 'force-dynamic'` so it doesn't statically pre-render
   - All other section layouts work in dev with real auth

6. **Given** a user with multiple Clerk roles (post-MVP scenario), **When** they need to switch active role, **Then**:
   - Mobile app exposes a role switcher hook `useActiveRole()` that lets a user with `family` and `rider` claims toggle between them. (Optional — placeholder until product asks for it.)

## Tasks / Subtasks

- [ ] Task 1: Implement web `getCurrentUserWithRole()` (AC: #1, #2, #5)
  - [ ] Replace placeholder in `apps/web/lib/auth/current-user.ts`
  - [ ] Use `auth()` + `currentUser()` from `@clerk/nextjs/server`
  - [ ] Wrap in React's `cache()` for request-scoped dedupe
  - [ ] Read order: sessionClaims.role → publicMetadata.role → null
  - [ ] Validate against the canonical `UserRole` set

- [ ] Task 2: Implement web role helpers (AC: #2)
  - [ ] Replace placeholder in `apps/web/lib/auth/roles.ts`
  - [ ] `hasRole(clerkUserId, role)` calls `clerkClient().users.getUser(clerkUserId)` and checks `publicMetadata.role`
  - [ ] `currentUserHasRole(role)` uses `getCurrentUserWithRole()`
  - [ ] `isOpsStaff(clerkUserId)` = dispatcher || admin

- [ ] Task 3: Implement web client `useRole()` (AC: #3)
  - [ ] Add `apps/web/app/api/me/role/route.ts` returning `{ role: UserRole | null }`
  - [ ] Update `apps/web/lib/auth/use-role.ts` to fetch the route on mount
  - [ ] Module-level memo so multiple `<RoleGate>` mounts share one fetch
  - [ ] Test happy path manually (no automated test — defer to integration test in Story 4)

- [ ] Task 4: Tighten mobile `useRole()` fallback (AC: #4)
  - [ ] Already reads publicMetadata.role from Story 1.5.2
  - [ ] Add `__experimental_jwt` extraction if Clerk Expo SDK exposes claims
  - [ ] Verify the deny-by-default branch works

- [ ] Task 5: Make root web page dynamic (AC: #5)
  - [ ] `apps/web/app/page.tsx` add `export const dynamic = 'force-dynamic'`
  - [ ] Verify build still succeeds with placeholder Clerk keys

- [ ] Task 6: (Optional) Role switcher for multi-role mobile users (AC: #6)
  - [ ] Document the design pattern in `apps/mobile/lib/auth/README.md` or in code comments
  - [ ] No implementation until product validates the need

- [ ] Task 7: Verify
  - [ ] `npm run typecheck` passes (root)
  - [ ] `npm run lint` passes (mobile + web)
  - [ ] `cd apps/web && CLERK env=placeholder npm run build` succeeds
  - [ ] `cd apps/mobile && npm test` matches the prior pass count

## Dev Notes

### Why JWT Claims Over DB Lookup

Per architecture: every request that needs a role check should be O(1). A JWT claim populated by Clerk's "JWT template" feature is the cheapest path — no DB query, no Clerk API hit. The DB row in `users.role` is the canonical write target; Clerk's user.publicMetadata mirrors it via the user-creation/role-change webhook (out of scope for this story — Story 5.16 wires the user account management webhooks).

### Clerk JWT Template Setup

Document for the operator: in the Clerk dashboard, create a JWT template with:

```json
{
  "role": "{{user.public_metadata.role}}"
}
```

Without this template configured, `sessionClaims.role` is undefined and we fall through to the `publicMetadata.role` path (one extra Clerk API call). The role still resolves correctly — just slightly slower.

### Caching Strategy

- Web server: React `cache()` dedupes within a request.
- Web client: module-level memo dedupes within a session.
- Mobile: Clerk's own session caches user state; `useRole()` re-derives every render but it's a pure function over `user.publicMetadata` so it's free.

### Why Not a Separate `user_roles` Table

The schema already stores `role` on the `users` table (see `packages/shared/src/db/schema.ts`). The 1.5.1 scaffold's comments referenced a `user_roles` table from the create-rell-app template — that doesn't apply to our schema. Updating those comments is part of this story.
