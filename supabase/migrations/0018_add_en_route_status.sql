-- Migration: 0018_add_en_route_status
-- Story 3.4: Add 'en_route' status for driver heading to pickup
-- FR22: Trip status transitions

-- Drop old constraint, add new one including 'en_route'
ALTER TABLE rides DROP CONSTRAINT IF EXISTS ride_status_check;

ALTER TABLE rides
  ADD CONSTRAINT ride_status_check
  CHECK (
    status IN (
      'pending',
      'confirmed',
      'pending_acceptance',
      'assigned',
      'en_route',
      'in_progress',
      'arrived',
      'completed',
      'cancelled'
    )
  );
