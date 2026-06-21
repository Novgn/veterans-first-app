# Mobile Maestro E2E Harness — Exhaustive Coverage + Reproducible Seed

**Date:** 2026-06-20
**Status:** Design — approved decisions captured, pending spec review
**Surface:** `apps/mobile` (Expo Router / React Native, Clerk + Supabase)

## Problem

The mobile app has ~50 screens but only two Maestro flows
(`smoke-welcome.yaml`, `rider-tour.yaml`). Only `smoke-welcome` was ever run
(once, manually, 2026-06-16). `rider-tour` is self-described "best-effort" and
has never been confirmed to pass. Authenticated flows are unverified because
they need a signed-in Clerk user **with the right role** plus backing Supabase
data — neither of which is provisioned reproducibly. Nothing runs in CI.

Goal: exhaustive, reproducible on-device coverage of every mobile screen, with
a one-command seed that makes authenticated flows runnable by anyone.

## Decisions (locked)

| Decision           | Choice                                                                       |
| ------------------ | ---------------------------------------------------------------------------- |
| Verification model | **Author flows + seed scripts** so any dev can run the full loop             |
| Breadth            | **Exhaustive** — every screen, all roles, profile sub-screens, edge + legal  |
| Edge states        | **Render-check only** (deep-link). Wiring real triggers is out of scope      |
| CI                 | **Opt-in / disabled** `workflow_dispatch` workflow; documented, not auto-run |

## Key facts grounding the design

- **Role** is read from Clerk `publicMetadata.role` (`lib/auth/use-role.ts`),
  synced to Supabase `users` via the `clerk-webhook` edge function. Root
  `app/index.tsx` routes a signed-in user to `(rider)`/`(driver)`/`(family)` by
  role (`dispatcher`/`admin` are web-only).
- **Data** lives in Supabase (33 migrations). The existing `supabase/seed.sql`
  uses **fake `clerk_id`s** (`test_rider_001`…) — valid for RLS unit tests,
  useless for real e2e, because the app resolves the Supabase row by the
  **real** Clerk user id after sign-in.
- **testIDs already exist** — ~425 occurrences across rider/driver/family
  screens and shared UI components, plus ~249 `accessibilityLabel`s. Adding
  testIDs is mostly _done_; the gap is flows + auth/data, not instrumentation.
- **Onboarding** is a client-side Zustand wizard (`@/stores/onboarding`) reached
  during sign-up, not gated by a DB flag.
- **Edge states** (`app/edge/offline|update-required|account-suspended`) are
  **orphan screens** — no trigger logic is wired to route to them.
- A native iOS build has been done here before (`apps/mobile/ios/Pods` present),
  so the `expo run:ios` simulator path is viable.
- Clerk dev **test mode**: allow-listed test phone numbers verify with the fixed
  code `424242`.

## Architecture

### Two honest test types

Exhaustive ≠ pretending every screen has a journey. Each screen is covered by
exactly one of:

1. **Behavioral e2e flow** — a real user journey against seeded data. Used for
   auth, onboarding, rider booking/rides/profile edits, driver day, family
   book-for-rider.
2. **Direct-navigation render check** — deep-link (`veterans-first://…`) to the
   screen, assert key elements, screenshot. Used for screens with no behavioral
   trigger: orphan edge states, legal, support, not-found, and wrong-role.
   (Detail screens like `rides/[id]` are reached behaviorally via their journey,
   so they are covered as behavioral flows, not render checks.)

This keeps the harness from _claiming_ behavioral e2e where the app has no
trigger.

### Directory shape

```
apps/mobile/.maestro/
  config.yaml                # tag definitions + shared env (test phones)
  subflows/
    sign-in-as-rider.yaml    # reusable runFlow building blocks
    sign-in-as-driver.yaml
    sign-in-as-family.yaml
    reset-app.yaml           # clearState launch
    deep-link.yaml           # parameterized openLink helper
  pre-auth/                  # welcome, sign-up, sign-in, verify
  onboarding/                # full wizard journey + per-step render checks
  rider/                     # tabs (home/rides/help/profile), booking/*, rides/*, profile/* (12)
  driver/                    # tabs (home/earnings/schedule/profile), trips/[id]
  family/                    # list, rider/[id], book, ride/[rideId]
  edge-and-legal/            # render checks: edge/*, legal/*, support, +not-found, wrong-role
  README.md                  # run guide (supersedes the current one)
```

Maestro **tags** (`pre-auth`, `onboarding`, `rider`, `driver`, `family`, `edge`)
allow running a slice: `maestro test --include-tags rider .maestro`.

### Seed script — `apps/mobile/scripts/e2e-seed.ts`

Idempotent (`find-or-create` / upsert), runnable via `npm run e2e:seed`, with a
`--teardown` flag. Two-sided because sign-in resolves the Supabase row by the
real Clerk id:

- **Clerk side** (`@clerk/backend`, `CLERK_SECRET_KEY`): find-or-create test
  users keyed by deterministic **test phone numbers**; set
  `publicMetadata.role`. Capture real user IDs. Fail loudly with a clear message
  if the dev instance does not have test mode enabled.
- **Supabase side** (service-role client): upsert `users` rows keyed to the real
  `clerk_id`s, plus role fixtures:
  - **Rider**: `saved_destinations` (home/work) + one upcoming and one past ride.
  - **Driver**: `driver_profiles` row + `driver_availability` + one assigned trip.
  - **Family**: an **approved** `family_links` row linking the family user to the
    seeded rider.
  - **Suspended**: a user flagged suspended, for the suspended render-check.

The existing `supabase/seed.sql` is left untouched (RLS unit tests still use it);
this script is additive and e2e-specific.

### Run scripts (`apps/mobile/package.json`)

| Script              | Does                                                  |
| ------------------- | ----------------------------------------------------- |
| `e2e:seed`          | Provision Clerk + Supabase test users/fixtures        |
| `e2e:seed:teardown` | Remove what the seed created                          |
| `e2e:ios`           | `maestro test .maestro` against a built simulator app |
| `e2e:ios:tag`       | `maestro test --include-tags <tag> .maestro`          |

README documents the loop: `expo run:ios` (build) → `e2e:seed` → `maestro test`,
including the dev-client bundle-load / dev-menu dismissal already in the current
README.

### CI — opt-in, disabled by default

`.github/workflows/e2e-mobile.yml` gated on `workflow_dispatch` only (no PR
trigger). Steps: macOS runner → EAS preview build (or local Release build) →
`e2e:seed` → `maestro test`. Required secrets documented in the workflow header:
`EAS token`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. The user enables/triggers it when ready.
Maestro Cloud (hosted device farm) is noted in the README as the eventual scale
path layered on the same flows + seed.

## Screen inventory → coverage map

| Surface       | Screens                                                                                                                                                    | Coverage                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Pre-auth      | welcome, sign-in, sign-up, verify                                                                                                                          | Behavioral (sign-up→verify journey)        |
| Onboarding    | veteran, address, emergency-contact, permissions-location, permissions-notifications, terms                                                                | Behavioral wizard + per-step render checks |
| Rider tabs    | index(home), rides, help, profile                                                                                                                          | Behavioral                                 |
| Rider booking | index(where), time, confirm, success                                                                                                                       | Behavioral (book-a-ride happy path)        |
| Rider rides   | rides/[id], rides/modify/[id]                                                                                                                              | Behavioral (view + modify/cancel)          |
| Rider profile | saved-places, add-place, edit-place, accessibility-preferences, comfort-preferences, notifications, family-access/index, family-access/add, delete-account | Behavioral edits                           |
| Driver        | tabs index/earnings/schedule/profile, trips/[id]                                                                                                           | Behavioral (go-online→trip→earnings)       |
| Family        | index, rider/[id]/index, rider/[id]/book, rider/[id]/ride/[rideId]                                                                                         | Behavioral (book-for-rider)                |
| Edge          | offline, account-suspended, update-required                                                                                                                | Render-check (deep-link)                   |
| Legal/misc    | legal/privacy, legal/terms, support, +not-found, WrongRoleScreen                                                                                           | Render-check (deep-link)                   |

## Out of scope

- Wiring real edge-state triggers (NetInfo offline detection, min-version gate,
  suspended-user routing). Flagged as a follow-up feature; this harness
  render-checks the screens only.
- Android run matrix (commands are cross-platform; iOS is the verified target).
- Any app behavior change beyond adding missing `testID`s.

## Risks

- **Clerk test mode** must be enabled on the dev instance with an allow-listed
  test-phone pattern, or `424242` sign-in fails. Seed checks and fails loudly.
- **testID gaps**: where a flow needs a selector that doesn't exist, add a
  `testID` (small, safe edit) rather than rely on brittle visible-text matching.
- **Secrets**: seed needs `CLERK_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` in the
  local env; document, never commit.

## Success criteria

1. `npm run e2e:seed` provisions a runnable rider, driver, family, and suspended
   user (Clerk + Supabase) idempotently.
2. Every screen in the inventory has a flow (behavioral or render-check) that
   asserts at least one stable element and captures a screenshot.
3. A documented one-command-per-step loop takes a fresh clone to green flows on
   a simulator.
4. Tags allow running any single surface in isolation.
5. An opt-in CI workflow exists and is documented but does not auto-run.
