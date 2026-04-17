# Story 1.5.1: Scaffold create-rell-app Monolith Skeleton

Status: done

## Story

As an architect,
I want apps/mobile + apps/web skeleton wired with create-rell-app role-gate primitives,
So that subsequent stories can migrate rider/driver/admin/business code into the consolidated monolith without redesigning the structure.

## Acceptance Criteria

1. **Given** the apps/ directory, **When** the scaffold is in place, **Then**:
   - `apps/mobile/` exists with `app/(auth)`, `app/(rider)`, `app/(driver)`, `app/(family)` route groups (.gitkeep placeholders)
   - `apps/mobile/features/{rider,driver,family}/` placeholders exist
   - `apps/mobile/components/auth/RoleGate.tsx` exists with the rell-template implementation
   - `apps/mobile/lib/auth/use-role.ts` exists exporting `useRole()` returning the active Clerk role claim
   - `apps/mobile/app.json` defines the consolidated Veterans 1st bundle id
   - `apps/mobile/package.json` and `tsconfig.json` exist (lean — no deps yet)

2. **Given** the apps/ directory, **When** the scaffold is in place, **Then**:
   - `apps/web/app/(auth)`, `app/dispatch`, `app/admin`, `app/business` placeholders exist
   - `apps/web/components/auth/RoleGate.tsx` and `apps/web/lib/auth/{current-user.ts,roles.ts,use-role.ts}` exist (server + client role helpers)
   - `apps/web/next.config.ts`, `package.json`, `tsconfig.json` exist

3. **Given** the new skeletons exist, **When** turbo boots, **Then**:
   - The existing `apps/rider`, `apps/driver`, `apps/admin`, `apps/business` apps still build and lint (no regression)
   - `apps/mobile` and `apps/web` are detected by the workspaces glob but compile as no-op shells

## Tasks / Subtasks

- [x] Create apps/mobile route groups + features placeholders
- [x] Add Clerk RoleGate + useRole primitives (mobile)
- [x] Configure apps/mobile/app.json with `com.veteransfirst.mobile`
- [x] Add minimal apps/mobile/package.json + tsconfig.json
- [x] Create apps/web route group placeholders (auth/dispatch/admin/business)
- [x] Add Clerk RoleGate + role helpers (web — current-user, roles, use-role)
- [x] Add minimal apps/web/{next.config.ts, package.json, tsconfig.json}
- [x] Verify existing apps still build (rider, driver, admin, business)
- [x] Commit: `feat(epic-1.5): story 1.5.1 scaffold apps/mobile + apps/web skeleton`

## Dev Notes

### Critical Requirements Summary

This story creates the **skeleton-only** for the role-gated monolith. No code is migrated yet — that happens in Stories 1.5.2 (mobile migration) and 1.5.3 (web migration). The intent is to establish the target shape so subsequent migrations slot in without restructuring.

### Pattern Source

RoleGate primitives borrowed from the create-rell-app monolith template:
https://github.com/Novgn/create-rell-app/tree/1bba500a71c46394f0341a0e9e6a0f309f5a0ca3

### Files Created

```
apps/mobile/
├── app.json                           # Veterans 1st bundle id
├── app/
│   ├── (auth)/.gitkeep
│   ├── (rider)/.gitkeep
│   ├── (driver)/.gitkeep
│   └── (family)/.gitkeep
├── components/auth/RoleGate.tsx       # role-aware route guard
├── features/{rider,driver,family}/.gitkeep
├── lib/auth/use-role.ts               # Clerk role hook
├── package.json
└── tsconfig.json

apps/web/
├── app/
│   ├── (auth)/.gitkeep
│   ├── dispatch/.gitkeep
│   ├── admin/.gitkeep
│   └── business/.gitkeep
├── components/auth/RoleGate.tsx
├── lib/auth/{current-user.ts, roles.ts, use-role.ts}
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Verification

Commit c687057 added 23 files (+322 lines). Existing rider/driver/admin/business apps remain untouched and continue to build per CI green status at time of commit.
