-- Migration: 0025_family_rides_rls
-- Story 4.3: Family members with an APPROVED family_links row for a rider
--            can SELECT that rider's rides and ride_events. Read-only; no
--            insert/update/delete granted here.

DROP POLICY IF EXISTS "Family members view linked rider rides" ON rides;
CREATE POLICY "Family members view linked rider rides" ON rides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_links fl
      WHERE fl.rider_id = rides.rider_id
        AND fl.status = 'approved'
        AND fl.family_member_id IN (
          SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
        )
    )
  );

DROP POLICY IF EXISTS "Family members view linked rider ride events" ON ride_events;
CREATE POLICY "Family members view linked rider ride events" ON ride_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM rides r
      JOIN family_links fl
        ON fl.rider_id = r.rider_id
       AND fl.status = 'approved'
      WHERE r.id = ride_events.ride_id
        AND fl.family_member_id IN (
          SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
        )
    )
  );
