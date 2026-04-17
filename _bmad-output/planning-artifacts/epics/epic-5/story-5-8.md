# Story 5.8: Implement Driver Earnings Tracking

**Status:** done

## Story

As an admin, I want per-ride driver earnings recorded so payroll can pay drivers accurately (FR61).

## Acceptance Criteria

1. **Given** a ride reaches status `completed` with `fare_cents` set, **When** `recordEarningsForRide(rideId)` runs, **Then** a `driver_earnings` row is written with `gross_amount_cents=fare_cents`, `company_fee_cents` = gross × configured fee rate (default 20%), `net_amount_cents = gross − company_fee`.
2. **Given** the same ride is passed twice, **Then** only one earnings row exists (unique on ride_id enforces this).
3. **Given** an admin opens `/business/drivers`, **Then** they see a per-driver pay-period summary (current + prior week by default) with ride count, gross total, company fee, and net pay.
4. **Given** an admin drills into a driver, **Then** they see a CSV-exportable line list of every earning row within the selected pay period.

## Implementation

- `packages/shared/src/utils/driverEarnings.ts` — pure helper `computeEarnings(fareCents, feeRate)` returning `{gross, fee, net}` with `Math.round` semantics. Fee rate defaults to 0.20.
- `apps/web/lib/billing/recordEarnings.ts` — `recordEarningsForRide(rideId)` reads the ride, computes earnings, and inserts (upsert-on-conflict by unique ride_id).
- `/business/drivers/page.tsx` — aggregate per-driver table filtered by pay period (reuses billingPeriods helper).
- `/business/drivers/[driverId]/page.tsx` — earnings line list + CSV export via `?format=csv`.

## Tests

- `driverEarnings.test.ts` — 4 cases: default fee, custom fee, zero fare, rounding precision.

## Dev Notes

- Safer choice: fee rate is hard-coded to 0.20 for this story. Configurable via Story 5.14 system_config once pricing ships — but that requires a coordinated migration of historical earnings, which is out of scope here. Earnings computed before that config change will reflect the 0.20 rate.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
