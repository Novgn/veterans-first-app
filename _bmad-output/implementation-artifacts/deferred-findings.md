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

## Epic 5 Full-Auto Pipeline (2026-04-17)

### Story 5-3 / 5-16 — Clerk invitation follow-ups

- **Medium:** The driver onboarding flow relies on Clerk invitations keyed off email. Drivers without an email fall back to a synthetic `<phone>@driver.placeholder` address — Clerk will accept the invitation but the magic-link email bounces. Follow-up: use Clerk phone-based invitations once Clerk's phone-invite API stabilizes.
- **Low:** `resetUserPassword` revokes active sessions but does not trigger Clerk's password-reset email. Users have to hit "Forgot password" on the sign-in screen themselves. Wire Clerk's `users.sendPasswordResetLink` once Anthropic SDK adds first-class support (currently only available via REST).

### Story 5-4 / 5-6 — Invoice sweep catch-up

- **Medium:** `generateInvoiceForRide` has no scheduled sweep; if the ride-completion hook fails to call it, the ride never gets invoiced. Add a nightly `sweepUninvoicedRides` cron that finds `completed` rides ≥30 min old without a matching invoice_line_items row.
- **Medium:** Consolidated invoice cron is written but never scheduled; ops needs a Vercel Cron or equivalent that calls `consolidateInvoicesForRider` for every rider on `weekly` / `monthly` billing frequency at the top of Monday / the first.
- **Low:** Invoice PDF generation isn't included; admin has to screenshot the detail page. Add a `/invoice.pdf` route once a PDF library is vetted (react-pdf / pdfkit).

### Story 5-5 — Real Stripe wiring

- **High:** Stripe charge is stubbed. Real Stripe integration needs env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`), SDK install, and full test coverage against Stripe test mode before production launch.
- **High:** Webhook route does not verify signature — any caller with the right JSON can mutate payment rows. Wire `stripe.webhooks.constructEvent` before exposing the route publicly.
- **Medium:** Mobile payment method management (Stripe Elements + Apple/Google Pay) is not in this story. Mobile rider profile still routes through the old hand-written screens.
- **Medium:** Refund flow (`payment_intent.refunded`) is not handled in the webhook yet. Add once refunds are user-accessible.

### Story 5-7 — Rider billing actions

- **Low:** Credit adjustments always increase the balance; admin cannot "take back" a credit via the UI. Helper `applyCreditDelta` supports negative deltas, so we could add a second form behind a confirmation — deferred until product decides whether it's wanted.
- **Low:** Waive reason currently hard-coded to "Waived by admin from rider billing screen". Add a textarea so admins can capture context.

### Story 5-8 — Earnings fee config

- **Medium:** Company fee rate is hard-coded to 20% in `computeEarnings`. Read from `system_config.pricing` once Story 5.14 data model includes `company_fee_rate`. Requires a migration of historical earnings.
- **Low:** Pay-period aggregation filters by `driver_earnings.created_at`, not ride completion date. In practice earnings are written at completion so they match, but a backfill or import could skew reports.

### Story 5-9 — Credential alerts dispatch

- **Medium:** Credential alerts are written to `audit_logs` but not yet sent as email/SMS to drivers and admins. Wire once notification transports are real (Story 4 deferred findings).
- **Low:** `REQUIRED_CREDENTIAL_TYPES` is hard-coded. Make configurable via `system_config` once regulators add more types (e.g., commercial license endorsements).

### Story 5-12 — HIPAA action taxonomy

- **Medium:** HIPAA export filters on a small set of hard-coded action names. Expand audit-log emission so every read path (dispatcher rider profile, admin rider detail, admin credentials view) emits an appropriate PHI access action.
- **Low:** Compliance exports don't paginate past 10k rows. Add cursor-based pagination for long audit windows.

### Story 5-13 — Booking-flow integration

- **Medium:** `pointInServiceArea` exists but is not called from `book-ride` or the booking UI yet. Wire it in Story 2.3 once Epic 2 re-opens for polish.
- **Low:** Store the polygon in PostGIS instead of JSONB to get index-backed spatial queries once usage justifies the cost.

### Story 5-14 / 5-15 — Booking-flow integration

- **Medium:** `computeRideFareCents` + `isWithinOperatingHours` are not yet called from the booking flow; they are exported for Epic 2 to consume. Track the wiring as an Epic 2 follow-up.

### Story 5-16 — Staff deactivation

- **Low:** No "deactivate" button for staff accounts yet. Clerk supports `ban` — add once role-based audit retention requirements are clearer.
