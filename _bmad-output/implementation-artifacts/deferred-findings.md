# Deferred Review Findings — Epic 3 Full-Auto Pipeline

Tracks Low/Info findings deferred during autonomous story execution. Organized chronologically.

## Pre-Pipeline Baseline (2026-04-17)

### [Info] Pre-existing test failure: ConfirmationModal.test.tsx

- **File:** `apps/mobile/components/rides/__tests__/ConfirmationModal.test.tsx`
- **Failure:** `TypeError: Cannot read properties of undefined (reading 'alert')` at `EditProfileSheet.tsx:86`
- **Origin:** Introduced during Story 2.12 (rider profile management); environment/mock issue unrelated to Epic 3.
- **Recommendation:** Add Alert mock to `jest.setup.js` or clear barrel re-export coupling between `components/rides` and `components/profile`.
- **Action:** Not fixed in this pipeline; scope is Epic 3 only.

### [Info] RLS policy tests fail without local Supabase

- **Files:** `packages/shared/src/db/__tests__/rls-policies.test.ts`, `audit-logging.test.ts`
- **Failure:** "Failed to connect to Supabase. Is local Supabase running?"
- **Origin:** Tests require local Supabase running via `supabase start`.
- **Recommendation:** Environmental — tests pass when Supabase is live. Skip in CI without Supabase.

## Epic 4 deferred findings

### Story 4-1

- **Low:** `/profile/notifications` link in the rider profile row will be unresolved until Story 4-5 ships; acceptable during the batch since 4-5 is in the queue.
- **Info:** Invited phone claim relies on the user-signed-in phone matching `phone` column exactly. Clerk phone onboarding already normalizes to E.164, but any future flow that skips normalization would break claim. Covered implicitly by Story 4-1 `normalizePhone`.

### Story 4-2

- **Medium (pre-existing):** Pre-existing flaky test pointing at `components/profile/EditProfileSheet.tsx:86` with `TypeError: Cannot read properties of undefined (reading 'alert')`. Reproduced before Story 4-2 changes — failure rotates across unrelated test files on each run (`useRiderHistory`, `RiderProfileCard`, etc.). Root cause appears to be an `Alert.alert` call whose `Alert` import becomes `undefined` under some Jest worker ordering. Not blocking the batch since each affected test passes in isolation; should be investigated via `--detectOpenHandles` in a dedicated cleanup pass.

### Story 4-4

- **Medium:** The family booking form takes pickup time as raw ISO text entry rather than a native date picker. Functional but rough UX. Track for a polish pass post-MVP; richer autocomplete/datepicker parity with the rider-side BookingWizard is out of scope for Epic 4.
- **Medium:** Family booking form uses free-text pickup/drop-off entry (no Google Places autocomplete). Defer richer destination picker until the UX polish phase.
