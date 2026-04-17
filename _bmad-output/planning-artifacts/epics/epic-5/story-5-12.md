# Story 5.12: Implement Compliance Reporting

**Status:** done

## Story

As an admin, I want exportable compliance reports — trip documentation completeness, driver credential status, audit log access, HIPAA access — so the business can satisfy regulators (FR56, FR64).

## Acceptance Criteria

1. **Given** an admin opens `/business/compliance`, **Then** they see a card per report (trip documentation, driver credentials, audit log, HIPAA access) with a date-range selector and a download button.
2. **Given** an admin downloads the trip documentation report for a date range, **Then** the CSV contains one row per completed ride with pickup/dropoff times, driver info, mileage, photo URL (or `NO_PHOTO`), and documentation-completeness flag (all required fields present).
3. **Given** an admin downloads the audit log report, **Then** the CSV contains every `audit_logs` row in the range with user, action, resource type/id, and timestamps.
4. **Given** an admin downloads the HIPAA access report, **Then** the CSV contains any `audit_logs` row where resource_type is `users`, `rider_preferences`, or `rides` and action matches a read/access pattern.

## Implementation

- `packages/shared/src/utils/tripDocumentation.ts` — pure helper that inspects a ride + events payload and reports `{ completeFields: string[]; missingFields: string[] }` so both the UI and CSV row share one definition of "complete".
- `/business/compliance/page.tsx` renders four cards with date range form.
- `/api/business/compliance/trip-docs.csv/route.ts`, `/audit.csv/route.ts`, `/hipaa.csv/route.ts` — admin-only CSV routes.
- Reuses `toCsv` from Story 5.10.

## Tests

- `tripDocumentation.test.ts` — 3 cases: all fields present, missing photo, missing mileage/pickup.

## Dev Notes

- Safer choice: HIPAA report filters on a known list of read/access `action` values (`rider_viewed`, `rider_profile_accessed`, `phi_accessed`, etc.). Those action names aren't emitted everywhere yet — tracked in deferred findings. The report still surfaces what we log today and is easy to extend once the audit taxonomy solidifies.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
