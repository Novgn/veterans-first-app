# Story 5.9: Implement Driver Credential Management

**Status:** done

## Story

As an admin, I want to track driver credentials, their expiration dates, and get alerts before they lapse, so every active driver is compliant (FR65, FR66, FR67).

## Acceptance Criteria

1. **Given** an admin opens `/admin/credentials`, **Then** they see a list of every driver with credential status (license, insurance, background check), the soonest expiring date per driver, and a warning badge if any credential is within 30 days of expiring or already expired.
2. **Given** an admin opens a driver's credentials page, **Then** they can see every credential row with issued/expiration dates, verification status, document URL, and can verify (status → `verified` with verifier + timestamp) or reject (status → `rejected` with a note).
3. **Given** the `/api/admin/credential-alerts` route is invoked (e.g. by cron), **Then** it classifies each credential row into `expired | expiring_30_days | ok` and writes an `audit_logs` entry per alert day so downstream dispatch (email/SMS) is idempotent.
4. **Given** all of a driver's required credentials (license, insurance, background check) are `verified` and not expired, **Then** the driver's `driver_profiles.is_active` flag is allowed to be flipped to true by the existing roster page; expired or rejected credentials block activation.

## Implementation

- `packages/shared/src/utils/credentialAlerts.ts` — pure classifier + aggregator:
  - `classifyCredential({ expirationDate, verificationStatus, today })` → `'expired' | 'expiring_30_days' | 'ok' | 'unknown'`
  - `areRequiredCredentialsVerified(rows)` → boolean (all of license + insurance + background_check must be `verified` and not expired).
- Admin screens:
  - `/admin/credentials` list aggregated per driver.
  - `/admin/credentials/[driverId]` per-driver manage + verify form.
- `apps/web/lib/admin/verifyCredential.ts` — server action updates status, flips driver profile active when all requirements met (or keeps false otherwise), writes audit log.
- `apps/web/app/api/admin/credential-alerts/route.ts` — cron-callable endpoint that iterates credentials and writes `credential_expiring` / `credential_expired` audit rows, idempotent per-day on (credential_id, alert_date) via content hash in new_values.

## Tests

- `credentialAlerts.test.ts` — 5 cases: ok far in future, expiring_30_days boundary, expired boundary, missing expiration, all-verified aggregator.

## Dev Notes

- Safer choice: blocking activation instead of auto-activating on credential verification. Admin still has to click "Reactivate" in Story 5.2's flow — the credentials state just unlocks the button. Auto-activation could silently put a driver back in the pool after a rejection is overridden.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
