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

### Story 4-6

- **Medium:** Push (Expo Push / FCM) and SMS (Twilio) transports are stubbed — the dispatcher logs structured metadata and writes a notification_logs row with status='sent', but no external API call fires yet. Tracked for Epic 5 ops work.
- **Medium:** Reminder cron route has no external scheduler wired up — it's callable with a Clerk session, but production requires a Vercel Cron or external scheduler hitting it with a service-role token. Tracked for Epic 5 deployment setup.
- **Low:** `windowRange` uses local `Date.now()` and UTC math for a ±5-min tolerance; if the cron interval drifts outside 10 minutes the reminder will be skipped. Acceptable for a scheduled cron firing every 5 minutes, but may need widening if ops picks a longer interval.

### Story 4-7

- **Medium:** `/api/notifications/ride` trusts the caller to pass the correct rideId without verifying the caller actually owns the ride (driver or rider). Low risk because the route only triggers notifications (no DB mutations), but hardening is recommended before going live.
- **Low:** `EXPO_PUBLIC_WEB_API_URL` is read as a process env; when unset (local dev) notifications silently no-op. Add a dev warning like other constants.
- **Info:** When the dispatcher reassigns a ride to a new driver, the old driver is not notified that the ride was taken back. Covered in Epic 5 ops work.

### Story 4-8

- **Medium:** No caller actually invokes `/api/notifications/driver` yet — dispatch console's ride-assignment page needs a post-assign hook. Route is ready and tested via the shared message builder; wiring deferred to Epic 5 dispatch UI work.
- **Medium:** Driver push token capture on sign-in is not implemented; requires `expo-notifications.getExpoPushTokenAsync()` at driver onboarding. Adds value only once transports are wired (see Story 4-6 finding).

### Story 4-10

- **Medium:** `notification_logs.content` stores the arrival photo URL as an unstructured suffix (`\nphoto:<url>`). A proper `metadata jsonb` column would be cleaner. Tracked for Epic 5 cleanup.
- **Low:** The fan-out does a photo lookup on every `ride_completed` call; one extra query per ride. Fine at MVP scale; batch or pre-aggregate if ride_events grows large.
