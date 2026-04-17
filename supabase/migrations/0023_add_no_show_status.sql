-- Migration: 0023_add_no_show_status
-- Story 3.10: Add 'no_show' as a distinct terminal ride status.

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
      'cancelled',
      'no_show'
    )
  );
