# Story 1.5.3: Migrate Admin + Business Code into apps/web

Status: in-progress

## Story

As an architect,
I want the admin and business Next.js apps consolidated under `apps/web/` with role-gated sections (dispatch, admin, business),
So that the role-aware monolith template (per the 2026-04-15 sprint change proposal) is realized for the web tier and Story 5 work can land directly on the new structure.

## Acceptance Criteria

1. **Given** the current `apps/admin` and `apps/business` Next.js apps, **When** the migration is complete, **Then**:
   - All current admin code (sign-in/sign-up routes, layout with ClerkProvider, root page placeholder) lives under `apps/web/app/`
   - All current business code (identical scaffolding) is consolidated into `apps/web/app/` (no duplication)
   - Git history for moved files is preserved via `git mv`

2. **Given** the consolidated routes, **When** a signed-in user navigates, **Then**:
   - `apps/web/app/(auth)/` hosts shared auth flows (sign-in, sign-up)
   - `apps/web/app/dispatch/` hosts dispatcher routes (placeholder index until Story 3.12+)
   - `apps/web/app/admin/` hosts admin routes (placeholder index until Story 3.12+)
   - `apps/web/app/business/` hosts business routes (placeholder index until Story 5.1+)
   - Each role section has a `layout.tsx` that role-gates via the existing `apps/web/components/auth/RoleGate.tsx`
   - Root `app/page.tsx` redirects authenticated users to their role section, unauth'd users to /sign-in
   - Root `app/layout.tsx` wires ClerkProvider conditionally (matching the existing CI-friendly pattern in admin/business)

3. **Given** the consolidated package, **When** `npm install` runs, **Then**:
   - `apps/web/package.json` declares the union of admin + business deps (they're identical)
   - `apps/web/middleware.ts` exists with Clerk middleware (per project rules: middleware in `src/middleware.ts` for Next.js)
   - `apps/web/tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` mirror admin's working config
   - `apps/web/app/globals.css` and `apps/web/src/lib/utils.ts` are present
   - `apps/web/public/` carries any required brand assets (favicon)

4. **Given** the consolidated package, **When** `npm run typecheck`, `npm run lint`, and `npm run build` run from `apps/web`, **Then**:
   - `tsc --noEmit` passes with zero errors
   - ESLint passes with zero errors
   - `next build` completes successfully (with placeholder env vars for Clerk)

5. **Given** the migration, **When** turbo runs from the repo root, **Then**:
   - `apps/admin/` and `apps/business/` directories are removed — workspaces glob `apps/*` no longer picks them up
   - Root scripts work end-to-end across `apps/mobile`, `apps/web`, `packages/shared`, `packages/config`

## Tasks / Subtasks

- [ ] Task 1: Move admin scaffolding into apps/web (AC: #1, #3)
  - [ ] `git mv apps/admin/src/app/layout.tsx apps/web/app/layout.tsx`
  - [ ] `git mv apps/admin/src/app/globals.css apps/web/app/globals.css`
  - [ ] `git mv apps/admin/src/app/sign-in apps/web/app/(auth)/sign-in`
  - [ ] `git mv apps/admin/src/app/sign-up apps/web/app/(auth)/sign-up`
  - [ ] `git mv apps/admin/src/app/favicon.ico apps/web/app/favicon.ico`
  - [ ] `git mv apps/admin/src/lib/utils.ts apps/web/src/lib/utils.ts`
  - [ ] `git mv apps/admin/middleware.ts apps/web/middleware.ts`
  - [ ] `git mv apps/admin/components.json apps/web/components.json`
  - [ ] `git mv apps/admin/eslint.config.mjs apps/web/eslint.config.mjs`
  - [ ] `git mv apps/admin/postcss.config.mjs apps/web/postcss.config.mjs`
  - [ ] `git mv apps/admin/public apps/web/public`
  - [ ] `git mv apps/admin/next.config.ts apps/web/next.config.ts` (overwriting the placeholder)

- [ ] Task 2: Drop business duplicates (AC: #1)
  - [ ] business and admin have identical scaffolds — delete the entire `apps/business/` tree
  - [ ] All apps/business work either replaced by admin migration or relocated to apps/web/app/business/

- [ ] Task 3: Author root web routing (AC: #2)
  - [ ] Update `apps/web/app/layout.tsx` brand to "Veterans 1st Console" (was "Veterans First Admin")
  - [ ] Update root navigation links to match new structure (sign-in path)
  - [ ] Add `apps/web/app/page.tsx` that redirects via `currentUser()` + role to `/dispatch | /admin | /business`
  - [ ] Add per-section `layout.tsx` files: `app/dispatch/layout.tsx`, `app/admin/layout.tsx`, `app/business/layout.tsx` — each wraps `<RoleGate allowedRoles=...>`
  - [ ] Add per-section `page.tsx` placeholders that surface "Coming with Story X" copy

- [ ] Task 4: Update apps/web/package.json with union deps + scripts (AC: #3)
  - [ ] Mirror admin scripts (dev, build, start, lint, typecheck, test)
  - [ ] Add Clerk + tailwind-merge + class-variance-authority + lucide-react + clsx deps

- [ ] Task 5: Configure typescript paths (AC: #3)
  - [ ] Update `apps/web/tsconfig.json` to include `src/**/*` and `app/**/*` and add `@/*` → `./src/*` alias to match Next.js conventions

- [ ] Task 6: Verify (AC: #4, #5)
  - [ ] Delete apps/admin, apps/business from disk
  - [ ] `npm install` from root
  - [ ] `cd apps/web && npm run typecheck` — must pass
  - [ ] `cd apps/web && npm run lint` — must pass
  - [ ] `cd apps/web && npm run build` — must pass with placeholder Clerk key (CI mode)

## Dev Notes

### Migration Strategy

apps/admin and apps/business are **near-identical scaffolds** (only the brand string differs). The simplest migration is:

1. Treat `apps/admin/src/*` as the canonical source — `git mv` it into `apps/web/`.
2. Discard `apps/business/` entirely (its content is the admin scaffold with a different name, no real implementation).
3. Add role-gated `layout.tsx` files to existing `apps/web/app/{dispatch,admin,business}` route stubs (already created in Story 1.5.1 as `.gitkeep` placeholders).

### Source Layout

Next.js App Router lives in `apps/web/app/` (not `apps/web/src/app/` — admin used `src/`, but the rell template flattens to top-level `app/`). For utility code, use `apps/web/src/lib/` (matches the rell template + admin's existing layout).

### Role-Gating Pattern (Web)

Use the existing primitives from Story 1.5.1:

- `apps/web/lib/auth/current-user.ts` — server-side user fetch (with role)
- `apps/web/lib/auth/roles.ts` — role helpers (server)
- `apps/web/lib/auth/use-role.ts` — client hook
- `apps/web/components/auth/RoleGate.tsx` — wraps children with role check

For section layouts (server components), call `currentUser()` in the layout and `redirect('/')` if role is wrong. For client components, use `<RoleGate>` (per the existing 1.5.1 implementation).

### Middleware

Clerk's `clerkMiddleware()` lives at `apps/web/middleware.ts` (not `src/middleware.ts` — Next.js looks for it at the root of the app). Inherits from admin's existing config.
