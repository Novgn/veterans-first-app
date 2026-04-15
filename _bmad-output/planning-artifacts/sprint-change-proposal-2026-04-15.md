# Sprint Change Proposal — Architectural Pivot

**Date:** 2026-04-15
**Author:** Wayne
**Scope Classification:** MAJOR (fundamental replan)
**Status:** APPROVED

---

## Section 1: Issue Summary

**Triggering Issue:** The original architecture defined four separate apps (rider mobile, driver mobile, admin web, business web) with significant duplication. A single role-aware mobile app can serve riders, drivers, and family members, and the web concerns can consolidate behind a single admin/business web app. The project should align with the [create-rell-app monolith template](https://github.com/Novgn/create-rell-app/tree/1bba500a71c46394f0341a0e9e6a0f309f5a0ca3) as the canonical structure.

**Why now:** Implementation is still early (Stories 2.13–2.14 just completed on the rider app; StatusToggle scaffolded for driver). Restructuring now avoids compounding drift across four app trees.

**Evidence:** Clerk already supports role-based access (rider/driver/family/dispatcher/admin) — roles were always going to gate features. Two near-identical Expo apps and two near-identical Next.js apps wasted shared-code opportunities the monorepo was meant to provide.

---

## Section 2: Impact Analysis

### App Consolidation

| Current                   | Proposed                         | Rationale                          |
| ------------------------- | -------------------------------- | ---------------------------------- |
| `apps/rider` (Expo)       | `apps/mobile` (Expo, role-gated) | Single app, route groups per role  |
| `apps/driver` (Expo)      | merged into `apps/mobile`        | Role-gated routes                  |
| `apps/admin` (Next.js)    | `apps/web` (Next.js, role-gated) | Dispatch + admin + business in one |
| `apps/business` (Next.js) | merged into `apps/web`           | Role-gated routes                  |

### Structural Changes (create-rell-app alignment)

| Current                             | Target (rell monolith)                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| `packages/shared` (types/api/hooks) | `packages/shared` (db/schema, queries, validation, drizzle.config) |
| `drizzle.config.ts` at root         | `packages/shared/drizzle.config.ts`                                |
| `supabase/migrations` at root       | `packages/shared/db/migrations`                                    |
| `packages/ui`                       | removed — mobile uses NativeWind; web uses shadcn/ui               |
| `packages/config`                   | keep; align with rell eslint/prettier setup                        |

### Epic Impact

| Epic                            | Original Target             | New Target                                     | Change                      |
| ------------------------------- | --------------------------- | ---------------------------------------------- | --------------------------- |
| Epic 1 — Foundation/Auth        | All apps                    | `apps/mobile` + `apps/web`                     | Setup stories halved        |
| Epic 2 — Rider Experience       | `apps/rider`                | `apps/mobile` (rider group)                    | Path-only                   |
| Epic 3 — Driver + Dispatch      | `apps/driver`, `apps/admin` | `apps/mobile` (driver) + `apps/web` (dispatch) | Split by platform, not role |
| Epic 4 — Family & Notifications | `apps/rider`                | `apps/mobile` (family role)                    | Role flag on user           |
| Epic 5 — Business Operations    | `apps/business`             | `apps/web` (business section)                  | Path-only                   |

### Story Impact

- Completed code (Stories 2.13–2.14 on `apps/rider`, StatusToggle on driver) moves into `apps/mobile/features/rider/` and `apps/mobile/features/driver/`. No logic rewrite.
- Epic 1 story list shrinks: "Initialize 4 apps" → "Initialize 2 apps via create-rell-app".
- All future stories re-target paths (rider/driver/admin/business → mobile/web).

### Technical Impact

- **Routing:** `apps/mobile/app/(rider)`, `apps/mobile/app/(driver)`, `apps/mobile/app/(family)` — Expo Router groups gated by Clerk `role` claim in `_layout.tsx`.
- **Role switching:** Multi-role users get a role switcher; single-role users auto-route.
- **Bundle size:** Single binary carries both rider + driver flows. Acceptable — Expo app size is dominated by RN runtime.
- **App Store:** Single listing ("Veterans 1st") simplifies ASO and review cycles.
- **Git history:** Preserved via `git mv`.

### Artifact Conflicts

| Artifact                     | Needs Update                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `architecture.md`            | Monorepo structure, FR-to-location mapping, starter commands, implementation sequence |
| `epics.md`                   | App targets on every FR table; Epic 1 setup story list                                |
| `prd.md`                     | Project Classification section                                                        |
| `ux-design-specification.md` | Role-switcher pattern; Stitch brand identity + screen mocks                           |
| `bmm-workflow-status.yaml`   | Log architecture revision                                                             |
| `sprint-status.yaml`         | Re-plan upcoming stories to new paths                                                 |

---

## Section 3: Recommended Approach

**Path: Direct Adjustment with Structural Migration**

1. Scaffold rell monolith into a scratch directory via `npx create-rell-app`.
2. Merge-in-place: `apps/rider/*` → `apps/mobile/features/rider/`; `apps/driver/*` → `apps/mobile/features/driver/`; consolidate `apps/admin` + `apps/business` into `apps/web`.
3. Relocate shared/db: `supabase/migrations` → `packages/shared/db/migrations`; `drizzle.config.ts` → `packages/shared/drizzle.config.ts`.
4. Rewire Clerk: role-based `_layout.tsx` route guards using rell `use-role` / `RoleGate` patterns.
5. Update planning artifacts (PRD §Classification, architecture §Monorepo, epics §App targets).
6. **Generate brand identity + screen mocks via Stitch MCP** (parallel track — see §4.6).
7. Re-plan remaining sprint against new paths.

**Effort:** ~3–5 days migration + artifact updates; Stitch brand + mocks run in parallel.

**Risk:**

- Medium — git history care on moves; CI workflows (`.github/workflows/*`) need path updates; `turbo.json` pipelines need review.
- Low on features — completed work preserved, just relocated.

**Timeline Impact:** ~1 week pause on feature work; net-positive thereafter.

---

## Section 4: Detailed Change Proposals

### 4.1 Architecture Document

Replace Monorepo Structure tree with:

```
veterans-first/
├── apps/
│   ├── mobile/              # Expo — role-gated (rider | driver | family)
│   │   └── app/
│   │       ├── (auth)/
│   │       ├── (rider)/
│   │       ├── (driver)/
│   │       └── (family)/
│   └── web/                 # Next.js — role-gated (dispatch | admin | business)
│       └── app/
│           ├── (auth)/
│           ├── dispatch/
│           ├── admin/
│           └── business/
├── packages/
│   ├── shared/              # db schema, queries, validation, drizzle.config
│   └── config/              # eslint, tsconfig, prettier
└── supabase/
    ├── config.toml
    └── functions/           # Edge functions; migrations moved to packages/shared/db
```

Replace 4 starter commands with:

```bash
npx create-rell-app@latest veterans-first --template monolith
```

Rewrite FR-to-Structure mapping per new paths.

### 4.2 PRD

Replace Project Classification:

> One role-aware mobile app (riders, drivers, family) and one role-aware web app (dispatch, admin, business). Roles enforced via Clerk claims + Supabase RLS.

### 4.3 Epics

Epic 1 setup stories become:

- **Story 1.1:** Scaffold monolith via create-rell-app
- **Story 1.2:** Migrate completed rider + driver work into `apps/mobile/features/`
- **Story 1.3:** Configure Clerk role claims + route-group guards
- **Story 1.4:** Migrate Supabase migrations + Drizzle config into `packages/shared/db/`

All FR tables: `apps/rider` → `apps/mobile (rider)`, etc.

### 4.4 UX Spec

Add **Role Switcher** component; confirm rider + driver visual systems coexist via route-group theming.

### 4.5 Code Migration (illustrative `git mv`)

```
apps/rider/src/features/*         → apps/mobile/features/rider/
apps/driver/src/features/*        → apps/mobile/features/driver/
apps/admin/src/features/*         → apps/web/app/dispatch/ + /admin/
apps/business/src/features/*      → apps/web/app/business/
supabase/migrations/*             → packages/shared/db/migrations/
drizzle.config.ts                 → packages/shared/drizzle.config.ts
```

### 4.6 Brand Identity + Mocks (Stitch MCP — Parallel Track)

1. **Create Stitch project:** `Veterans 1st` with project description from PRD Executive Summary.
2. **Create design system** capturing brand tokens:
   - Voice: "Warm & Minimal" (per UX spec)
   - Ethos: "It's not about the miles. It's about the service."
   - Palette: warm neutrals + trust-forward accent; high-contrast for WCAG 2.1 AA+
   - Typography: 48dp+ touch targets; senior-legible type scale
   - Iconography: literal, low-cognitive-load
3. **Generate mobile screens** (rider, driver, family route groups): sign-in, 3-tap booking (Where → When → Confirm), ride detail w/ driver card, ride tracking, driver trip queue, driver trip flow, family dashboard w/ notifications.
4. **Generate web screens:** dispatcher fleet map, dispatcher bookings, admin driver roster, admin credentials, business billing/invoicing, business reports.
5. **Generate variants** of each key screen to pressure-test the brand.
6. **Apply design system** across all screens; export to reference in UX spec and frontend-design skill.
7. **Deliverable:** screens + palette/tokens captured under `_bmad-output/design/stitch/` with references added to `ux-design-specification.md`.

---

## Section 5: Implementation Handoff

**Scope:** MAJOR — requires fundamental replan.

**Handoff recipients:**

- **Architect (Winston):** Refactor `architecture.md` — Monorepo Structure, Starter Commands, FR Mapping, Implementation Sequence, Validation.
- **PM (John):** Update `prd.md` Project Classification; signoff on consolidated app model.
- **UX (Sally):** Drive Stitch MCP brand + screen mock generation; update `ux-design-specification.md` with role-switcher pattern and Stitch references.
- **Sprint Planner:** Rewrite Epic 1 setup stories (1.1–1.4); re-target downstream stories to new paths.
- **Dev (Amelia):** Execute migration after artifact updates — scaffold rell, `git mv` features, rewire imports, update `turbo.json` + CI workflows.

**Success criteria:**

- `apps/mobile` + `apps/web` + `packages/shared` (matching rell monolith) replace the 4-app layout.
- All completed story code (Stories 2.13–2.14, StatusToggle) runs from new paths with tests green.
- Clerk role gating routes users to the right route group on sign-in.
- CI (`ci.yml`) passes on the restructured monorepo.
- Stitch-generated brand identity + screen mocks published and referenced in UX spec.
- `architecture.md`, `prd.md`, `epics.md`, `ux-design-specification.md` updated and consistent.

---

## Approval

**Approved by:** Wayne — 2026-04-15
