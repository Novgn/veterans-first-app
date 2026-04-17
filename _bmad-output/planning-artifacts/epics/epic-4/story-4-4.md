# Story 4.4: Implement Family Ride Booking

**Status:** done

## Story

As a family member with booking permission, I want to book rides on behalf of my loved one so I can help manage their transportation.

## Acceptance Criteria

1. **Given** a family member with `permissions.book_rides = true` on an approved link, **Then** the per-rider dashboard shows a "Book a Ride" entry point.
2. **Given** a family member without booking permission, **Then** the entry point is hidden (and server-side RLS also rejects direct inserts).
3. **Given** the family member fills out pickup, dropoff, and pickup time, **When** they submit, **Then** a `rides` row is created with `rider_id` pointing at the linked rider and a new `booked_by_id` column pointing at the family user.
4. **Given** the database enforces who can insert, **Then** a family user can only insert rides for riders they have an `approved` family link to with `permissions.book_rides = true`.

## Implementation

- Migration `0026_rides_booked_by_family.sql`:
  - Adds `booked_by_id UUID REFERENCES users(id)` to `rides` (nullable — default to the rider when absent, populated when a family member books).
  - Adds an RLS `INSERT` policy `"Family members book for linked riders"` that requires an approved link with `permissions->>'book_rides' = 'true'` AND `booked_by_id = auth_user_id`.
- Drizzle schema: mirrors `booked_by_id` on `rides`.
- New hook `useFamilyBookRide` — validates inputs, resolves Supabase user id for the current Clerk session, inserts the ride with `rider_id` + `booked_by_id`, invalidates both the rider-side rides cache and the family-side rides cache.
- New screen `apps/mobile/app/(family)/rider/[id]/book.tsx` — minimal 3-field form (pickup, dropoff, scheduled time as ISO string). Reuses TextInput + NativeWind; leaves richer destination autocomplete to a future enhancement (tracked in deferred findings).
- Family rider dashboard now renders a "Book a Ride" button gated on `link.permissions.book_rides`.

## Tests

- `useFamilyBookRide.test.ts` — 3 cases: happy path, rejects missing fields, rejects when supabase insert fails.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
