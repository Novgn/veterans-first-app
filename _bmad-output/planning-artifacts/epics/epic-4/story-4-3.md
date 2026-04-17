# Story 4.3: Implement Family Member Dashboard

**Status:** done

## Story

As a family member, I want to see my linked rider's upcoming and past rides, so I know they're getting to their appointments safely.

## Acceptance Criteria

1. **Given** a family-role user opens the app, **Then** the home screen lists approved linked riders (Story 4.1) and tapping a card navigates to that rider's dashboard.
2. **Given** the rider dashboard, **Then** upcoming and completed rides are visible with status, pickup, destination, time, and driver name when assigned.
3. **Given** a ride in the list, **When** the family member taps it, **Then** a read-only ride detail appears with the status timeline and arrival photo (if present).
4. **Given** the family member has no booking permission, **Then** no "Book Ride" / "Cancel" / "Modify" controls are rendered (Story 4.4 adds the booking entry point when permission is granted).

## Implementation

- Migration `0025_family_rides_rls.sql`: adds a SELECT policy on `rides` and `ride_events` that lets a user read rows when an **approved** `family_links` row exists linking them to the rider. Uses the same Clerk-JWT lookup pattern as other policies.
- New hook `useFamilyRiderRides(riderId)` — pulls upcoming + completed rides via Supabase, grouped client-side by tense (upcoming vs history).
- New hook `useFamilyRideDetail(rideId)` — fetches the ride, driver profile, and timeline events.
- New screens:
  - `apps/mobile/app/(family)/rider/[id]/index.tsx` — rides list for one linked rider
  - `apps/mobile/app/(family)/rider/[id]/ride/[rideId].tsx` — read-only ride detail
- `(family)/_layout.tsx` registers the new routes with headers.
- `(family)/index.tsx` — the linked-rider cards in the dashboard are now wrapped in `<Link>` pointing at `/rider/[id]`.

## Tests

- `useFamilyRiderRides.test.ts` — 2 cases: fetches rides for linked rider, returns empty when user not synced.
- `useFamilyRideDetail.test.ts` — 2 cases: fetches ride + events, handles missing ride.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
