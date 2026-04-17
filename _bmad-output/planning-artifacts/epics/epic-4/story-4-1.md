# Story 4.1: Implement Family Member Linking

**Status:** done

## Story

As a rider, I want to grant family members access to view my rides, so they have peace of mind without invading my privacy.

## Acceptance Criteria

1. **Given** the rider opens Profile → Family Access, **Then** they see the list of linked family members with status (pending/approved) and an "Add Family Member" button.
2. **Given** the rider taps "Add Family Member" and submits a phone number, **Then** a `family_links` row is created with status `pending`, pointing to the matching family user if one exists (or storing the invited phone otherwise).
3. **Given** a signed-in user with the `family` role has pending invitations, **Then** they see them on the family dashboard and can accept/decline; accept flips the link to `approved` and the rider sees the updated status.
4. **Given** the db enforces status via CHECK constraint and unique `(rider_id, family_member_id)`, **Then** no malformed or duplicate links can be stored.

## Implementation

- Migration `0024_family_links_enhancements.sql`:
  - Adds `relationship TEXT` and `permissions JSONB` defaulted to `{"view_rides":true,"book_rides":false,"receive_notifications":true}`.
  - Adds `invited_phone TEXT` for pending invites when the phone isn't yet a user.
  - Relaxes `family_member_id` NOT NULL (allows null when phone is invited but user doesn't exist yet).
  - RLS: riders CRUD links where `rider_id = auth user`; family members SELECT/UPDATE (approve) links where `family_member_id = auth user`; dispatchers/admins read-only.
  - Indexes on `rider_id`, `family_member_id`, `invited_phone`, and `status`.
- Drizzle schema: mirrors new columns + nullability; exports `FamilyLinkPermissions` typed shape.
- Mobile hooks (`apps/mobile/hooks`):
  - `useFamilyLinks(role: 'rider' | 'family')` — list links for current user
  - `useInviteFamilyMember` — invite by phone (E.164)
  - `useRespondToFamilyInvite` — approve/decline
  - `useRevokeFamilyLink` — rider revokes a link (used in Story 4.2)
- Mobile screens:
  - `/profile/family-access` — rider list + add button
  - `/profile/family-access/add` — phone-entry + relationship selector
  - `(family)/invitations` — pending invitations view for family role users
  - Profile screen's Family Access row now links to `/profile/family-access`.
- Query keys: `familyLinkKeys.*` factory added to `@/hooks/familyLinkKeys.ts`.

## Tests

- `useFamilyLinks.test.ts` — filters by role + returns rows
- `useInviteFamilyMember.test.ts` — E.164 normalization, user lookup path, invited-phone path
- `useRespondToFamilyInvite.test.ts` — approve flips status, decline hard-deletes (so rider can re-invite)

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
