-- Migration: 0026_rides_booked_by_family
-- Story 4.4: Track the booking user (self vs family) and allow family
--            members with book_rides permission to insert rides on
--            behalf of their linked rider.

ALTER TABLE rides
  ADD COLUMN IF NOT EXISTS booked_by_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_rides_booked_by_id ON rides(booked_by_id);

-- RLS: in addition to the existing rider-self insert policy, allow a
-- family member with an approved link (and book_rides permission) to
-- insert rides for that rider — but only if they stamp themselves as
-- booked_by_id so the audit trail is always truthful.
DROP POLICY IF EXISTS "Family members book for linked riders" ON rides;
CREATE POLICY "Family members book for linked riders" ON rides
  FOR INSERT WITH CHECK (
    booked_by_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    AND EXISTS (
      SELECT 1 FROM family_links fl
      WHERE fl.rider_id = rides.rider_id
        AND fl.family_member_id = rides.booked_by_id
        AND fl.status = 'approved'
        AND (fl.permissions->>'book_rides')::boolean = TRUE
    )
  );
