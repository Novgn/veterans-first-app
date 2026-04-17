# Story 1.5.2: Migrate Rider + Driver Code into apps/mobile

Status: in-progress

## Story

As an architect,
I want all completed rider and driver code consolidated under `apps/mobile/` with role-gated route groups,
So that the role-aware monolith template (per the 2026-04-15 sprint change proposal) is realized without rewriting any feature logic, and Stories 3.4+ can land directly on the new structure.

## Acceptance Criteria

1. **Given** the current `apps/rider` and `apps/driver` Expo apps, **When** the migration is complete, **Then**:
   - `apps/rider/src/*` lives under `apps/mobile/features/rider/*` (preserving the internal feature structure: booking, drivers, profile, rides, tracking, plus lib/components/stores)
   - `apps/driver/src/*` lives under `apps/mobile/features/driver/*` (preserving trips, schedule, earnings, profile, plus lib/components/stores/utils/test-utils)
   - All git history for moved files is preserved via `git mv` (or filemode-equivalent rename detection)

2. **Given** the route files (`app/`), **When** the migration is complete, **Then**:
   - Rider routes live under `apps/mobile/app/(rider)/` (booking, profile, rides, details, +not-found, the (tabs) group, index)
   - Driver routes live under `apps/mobile/app/(driver)/` (trips, +not-found, the (tabs) group, index)
   - Auth routes are unified under `apps/mobile/app/(auth)/` (sign-in, sign-up, verify, \_layout)
   - Top-level `_layout.tsx` provides ClerkProvider + TanStack Query persistence + ErrorBoundary, branching to (rider) | (driver) | (family) based on Clerk role claim
   - Top-level `index.tsx` redirects to the correct role group (or /(auth)/sign-in if signed out)

3. **Given** the consolidated package, **When** `npm install` runs, **Then**:
   - `apps/mobile/package.json` declares the union of dependencies from rider + driver (resolving any version mismatches to the higher version)
   - `apps/mobile/tsconfig.json` defines path aliases `@rider/*` → `./features/rider/*`, `@driver/*` → `./features/driver/*`, `@/*` → `./*`
   - `apps/mobile/jest.config.*`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `eslint.config.js`, `prettier.config.js`, `global.css`, `nativewind-env.d.ts`, `expo-env.d.ts`, `__mocks__/`, `assets/` are present and merged where applicable

4. **Given** the consolidated package, **When** `npm run typecheck`, `npm run lint`, and `npm run test` run from `apps/mobile`, **Then**:
   - `tsc --noEmit` passes with zero errors
   - ESLint passes with zero errors
   - The full Jest suite (rider + driver) passes (or matches the prior pass count from `apps/rider` + `apps/driver` — no regressions)

5. **Given** the migration, **When** turbo runs `npm run build/lint/typecheck/test` from the repo root, **Then**:
   - `apps/rider/` and `apps/driver/` directories are removed (or completely empty + ignored) — the workspaces glob `apps/*` no longer picks them up
   - Root scripts continue to work
   - CI workflow path references are updated to `apps/mobile`

6. **Given** the role-gated structure, **When** a signed-in user with role=rider opens the app, **Then**:
   - They land in `(rider)/(tabs)` (per the existing rider tab layout)
   - Driver-only routes are blocked by `RoleGate`
   - Family routes show a "coming soon" placeholder (Story 4 work)

## Tasks / Subtasks

- [ ] Task 1: Stage apps/mobile config files (AC: #3)
  - [ ] Copy babel.config.js, metro.config.js, tailwind.config.js, eslint.config.js, prettier.config.js, global.css, nativewind-env.d.ts, expo-env.d.ts, jest.setup.js, jest.setup-before.js from apps/rider into apps/mobile
  - [ ] Copy `__mocks__/` from apps/rider (rider mocks are a superset of driver mocks)
  - [ ] Copy `assets/` from apps/rider (rider assets are the canonical brand assets)

- [ ] Task 2: Author apps/mobile/package.json with union of deps (AC: #3)
  - [ ] Resolve dep version conflicts (take the higher SemVer)
  - [ ] Mirror the rider scripts (start, ios, android, web, dev, prebuild, lint, format, typecheck, test, test:watch, test:coverage)
  - [ ] Mirror the rider Jest config block but extend `moduleNameMapper` with `^@rider/(.*)$` and `^@driver/(.*)$`

- [ ] Task 3: Update apps/mobile/tsconfig.json with path aliases (AC: #3)
  - [ ] Add `@rider/*`, `@driver/*` aliases alongside the existing `@/*`
  - [ ] Inherit from `@veterans-first/config/typescript/react-native` and `expo/tsconfig.base.json`
  - [ ] Add includes for `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`, `expo-env.d.ts`, `nativewind-env.d.ts`

- [ ] Task 4: Move rider source via `git mv` (AC: #1)
  - [ ] `git mv apps/rider/src apps/mobile/features/rider`
  - [ ] Verify all internal `../../../lib/...` and `../../../stores/...` relative paths still resolve (they do — only the parent dir changed)

- [ ] Task 5: Move driver source via `git mv` (AC: #1)
  - [ ] `git mv apps/driver/src apps/mobile/features/driver`
  - [ ] Verify all internal relative paths still resolve

- [ ] Task 6: Move rider routes into (rider) group (AC: #2)
  - [ ] Move (tabs), booking, profile, rides, details.tsx, +not-found.tsx, +html.tsx, index.tsx, app/\_layout.tsx into apps/mobile/app/(rider)/ (the rider \_layout becomes the (rider)/\_layout.tsx)
  - [ ] Auth routes from apps/rider/app/(auth)/ go to apps/mobile/app/(auth)/ (shared)
  - [ ] Bulk-update imports: `'../src/'` → `'@rider/'`; `'../../src/'` → `'@rider/'`; `'@/'` → `'@rider/'` (only in moved rider routes)

- [ ] Task 7: Move driver routes into (driver) group (AC: #2)
  - [ ] Move (tabs), trips, +not-found.tsx, index.tsx into apps/mobile/app/(driver)/
  - [ ] Driver app/\_layout.tsx merges with rider \_layout — extract shared providers, keep driver-specific tab/stack config in (driver)/\_layout.tsx
  - [ ] Bulk-update imports: `'../src/'` → `'@driver/'`; `'../../src/'` → `'@driver/'`

- [ ] Task 8: Author apps/mobile/app/\_layout.tsx (AC: #2, #6)
  - [ ] Wrap children in ClerkProvider + ClerkLoaded + PersistQueryClientProvider + ErrorBoundary
  - [ ] Render Stack with screen options for (auth), (rider), (driver), (family)
  - [ ] Re-use queryClient + asyncStoragePersister from rider's lib/queryClient

- [ ] Task 9: Author apps/mobile/app/index.tsx (AC: #6)
  - [ ] If !isSignedIn → Redirect to /(auth)/sign-in
  - [ ] Else use `useRole()` to redirect to /(rider) | /(driver) | /(family)
  - [ ] Default unknown role → /(rider) (most common)

- [ ] Task 10: Author (rider)/\_layout.tsx, (driver)/\_layout.tsx, (family)/\_layout.tsx (AC: #6)
  - [ ] Each layout wraps children in `<RoleGate role="rider|driver|family">` from existing `apps/mobile/components/auth/RoleGate.tsx`
  - [ ] Family layout shows a "coming soon" placeholder until Epic 4

- [ ] Task 11: Verify and clean up (AC: #5)
  - [ ] Remove apps/rider, apps/driver directories (after confirming all files are migrated)
  - [ ] Update .github/workflows/ paths from `apps/rider`, `apps/driver` → `apps/mobile`
  - [ ] Update root README references if any

- [ ] Task 12: Install + verify (AC: #4)
  - [ ] `npm install` from repo root
  - [ ] `cd apps/mobile && npm run typecheck` — must pass
  - [ ] `cd apps/mobile && npm run lint` — must pass
  - [ ] `cd apps/mobile && npm run test` — must pass with all rider + driver tests

## Dev Notes

### Migration Strategy

Use `git mv` for entire directory trees rather than per-file moves, since the rider/driver `src/` internal layout is preserved. Internal relative imports (`../../../lib/supabase`) remain valid because the parent directory swap doesn't change the relative path. Only **route-level** imports that crossed the `app/` ↔ `src/` boundary need rewriting, and those become absolute alias imports (`@rider/`, `@driver/`).

### Path Alias Mapping

| Old (rider)                   | New (mobile)                  |
| ----------------------------- | ----------------------------- |
| `../src/lib/queryClient`      | `@rider/lib/queryClient`      |
| `../../src/components/Header` | `@rider/components/Header`    |
| `../../src/features/booking`  | `@rider/booking`              |
| `../../src/stores/...`        | `@rider/stores/...`           |
| `@/components/Container`      | `@rider/components/Container` |

| Old (driver)                 | New (mobile)               |
| ---------------------------- | -------------------------- |
| `../src/lib/queryClient`     | `@driver/lib/queryClient`  |
| `../../src/features/trips`   | `@driver/trips`            |
| `../../src/stores/tripStore` | `@driver/stores/tripStore` |

### Dep Version Resolution

When rider and driver disagree on a version, take the **higher** version unless a known-bad bump exists. Document any conflicts.

### Existing apps Cleanup

Once all files are migrated and the mobile app builds + tests, delete `apps/rider` and `apps/driver`. CI workflow path references update in the same commit.

### Known Quirks

- Rider's `app/(auth)/_layout.tsx` redirects signed-in users to `/(tabs)`. After consolidation it should redirect via `useRole()` to the correct role group. Story 1.5.4 finalizes role-gate logic; for this story, hardcode to `/(rider)` so rider flow continues to work end-to-end.
- Driver app currently has its own `(auth)` group identical to rider's. Drop the driver auth copy — use the unified rider auth.
- Rider's `app/(auth)/_layout.tsx` doesn't import role helpers. Keep it minimal here; expand in 1.5.4.
