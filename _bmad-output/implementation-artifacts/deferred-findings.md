# Deferred Findings — Epic 1.5 Full-Auto Batch

Findings from `/bmad-full-auto epic-1-5` runs that are **not auto-fixed in
the same story** because they are pre-existing or low-priority. Each entry
links to the originating story for context.

---

## From Story 1.5.2 (apps/rider + apps/driver → apps/mobile)

### LOW — Async test-leak across files makes one random Jest suite fail per full-suite run

- **Where:** `apps/mobile/features/rider/profile/components/__tests__/EditProfileSheet.test.tsx` (and possibly one more sibling). When the full Jest suite runs, exactly one downstream test file (e.g. `WaitTimeIndicator.test.tsx`, `TripCard.test.tsx`) fails with `TypeError: Cannot read properties of undefined (reading 'alert')` originating from `features/rider/profile/components/EditProfileSheet.tsx`.
- **Repro:** `cd apps/mobile && npm test`. Each run produces 608/609 passing; the failing test rotates between runs. Failing test always passes in isolation (`npm test -- --testPathPattern=<name>`).
- **Root cause:** `EditProfileSheet.tsx` calls `Alert.alert(...)` from a `.catch()` in `handleSave`. The promise resolves AFTER the test that triggered it has unmounted, in the worker that has since moved on to a different test file. By that point the `react-native` module's `Alert` binding is gone (the worker re-evaluates modules), producing the error.
- **Pre-existing:** Yes — present in `apps/rider` before the migration. Migration only relocated the test file.
- **Suggested fix:** wrap `await waitFor(...)` around the assertions in EditProfileSheet error tests so all pending promises drain before the test ends. Or convert the catch's `Alert.alert` into `useState` + render path so it stops being async-orphaned.
- **Risk if not fixed:** CI flakes. 1/60 (~1.7%) of suite runs fails for this reason. Doesn't reflect a real bug, just sloppy test cleanup.

### LOW — ESLint warnings (29) carried over from rider/driver code

- **Where:** Various `apps/mobile/features/rider/**/*.{ts,tsx}` files: unused variable warnings in test files, missing `useEffect` deps in `ContactDriverSheet`, an `import/order` quibble in `DestinationPicker`, etc.
- **Pre-existing:** All present in `apps/rider` / `apps/driver` before the migration.
- **Suggested fix:** sweep with `npm run format` (which runs `eslint --fix`) and manually fix the `react-hooks/exhaustive-deps` cases.
- **Risk if not fixed:** None — they're warnings not errors. ESLint exits 0.

### INFO — `apps/mobile/features/rider/lib/queryClient.ts` is now duplicated by `apps/mobile/lib/queryClient.ts`

- **Where:** Both files exist. The root `lib/queryClient.ts` is what the new root `_layout.tsx` uses; the `features/rider/lib/queryClient.ts` is still imported by tests (`createTestWrapper`) and possibly by some legacy code paths.
- **Suggested fix:** in a follow-up, delete `apps/mobile/features/rider/lib/queryClient.ts` and `apps/mobile/features/driver/lib/queryClient.ts`, repoint test wrappers and any leftover imports to `@/lib/queryClient`.
- **Risk if not fixed:** Two QueryClient instances are created at runtime if any feature code still imports the rider/driver-local one. The root layout uses the consolidated one, but feature-local hooks may still see a separate cache.

---

## From Story 1.5.3 (apps/admin + apps/business → apps/web)

### LOW — `apps/web/components/auth/RoleGate.tsx` and `eslint.config.mjs` carry pre-existing import-order warnings

- **Where:** RoleGate has 3 `import/order` warnings inherited from the 1.5.1 scaffold; `eslint.config.mjs` has 1 inherited from admin's original config.
- **Pre-existing:** Yes — present in 1.5.1 scaffold and the admin app before migration.
- **Suggested fix:** `npx eslint --fix apps/web/**/*.{ts,tsx,mjs}`.
- **Risk if not fixed:** None — warnings, exit 0.

### INFO — Section layouts double-fetch `getCurrentUserWithRole()` when navigating from `/`

- **Where:** `apps/web/app/page.tsx` calls `getCurrentUserWithRole()` to role-route, then redirects to (e.g.) `/admin`, where `apps/web/app/admin/layout.tsx` calls it again.
- **Suggested fix:** Wrap `getCurrentUserWithRole` in React's `cache()` so it dedupes within a single request. (Story 1.5.4 should incorporate this when wiring the real Clerk + Drizzle lookup.)
- **Risk if not fixed:** One extra DB hit + one extra Clerk call per navigation. Negligible in dev, undesirable in prod under load.

## From Story 1.5.4 (Clerk role claims + route guards)

### LOW — Clerk JWT template not configured; web hits Clerk API on every server-side role check

- **Where:** `apps/web/lib/auth/current-user.ts`. The fast path reads `sessionClaims.role`, but without a Clerk JWT template populating that claim, every check falls through to `currentUser()` (one Clerk API call per request, cached by React's `cache()` so still O(1) per request).
- **Suggested fix:** Operator step — in the Clerk dashboard, create a JWT template with `{"role": "{{user.public_metadata.role}}"}`. Document in deployment runbook (Story 5.16's webhook story is a natural place).
- **Risk if not fixed:** ~50ms extra per first-page-load per signed-in user. Acceptable for MVP.

### LOW — Mobile useRole reads only publicMetadata; sessionClaims fallback not yet wired

- **Where:** `apps/mobile/lib/auth/use-role.ts`. Reads `user.publicMetadata?.role` from Clerk Expo's `useUser()`. There's no JWT-claim fallback because Clerk Expo's `useAuth` doesn't expose decoded claims directly (would need to decode the token via `getToken()`).
- **Suggested fix:** When Clerk Expo SDK exposes session claims, add a JWT-template path mirroring the web implementation.
- **Risk if not fixed:** None — `publicMetadata.role` is the canonical client-side source. Same call, just no JWT shortcut.

### INFO — `/api/me/role` doesn't add explicit Cache-Control: no-store

- **Where:** `apps/web/app/api/me/role/route.ts`. Marked `dynamic = 'force-dynamic'` (so Next.js won't cache), but no explicit `Cache-Control` header. Browsers and intermediate proxies may still cache.
- **Suggested fix:** Add `headers: { 'Cache-Control': 'no-store' }` to the NextResponse.
- **Risk if not fixed:** Stale roles served from browser/proxy cache after a role change. Low risk for MVP since role changes are rare.

### INFO — Web client useRole has no manual refresh API

- **Where:** `apps/web/lib/auth/use-role.ts`. After cache populates, the only invalidation is on user change (sign out / different user). If an admin updates a user's role mid-session, the user keeps seeing the old role until sign out + sign in.
- **Suggested fix:** Export a `refreshRole()` function and trigger it on a websocket / poll when needed. Defer until a real use case appears.
- **Risk if not fixed:** Stale UI gating until the user's next session. Server-side checks remain correct (no React cache reuse across requests).

---

### INFO — 'business' is not a UserRole; admins own the section

- **Where:** `apps/web/app/business/layout.tsx` checks `user.role !== 'admin'`. The `UserRole` type set is `rider | driver | family | dispatcher | admin` — there's no `business` role. Until / unless a `business` role is introduced (Story 5.1+), admins own all business operations.
- **Suggested fix:** None now. If a separate business-staff role is needed in Story 5, expand `UserRole` in `packages/shared/src/types/index.ts` and update this gate.
- **Risk if not fixed:** None.
