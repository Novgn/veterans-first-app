-- Migration: Add confirmed and arrived ride statuses
-- Story 2.8: Implement My Rides Screen with Upcoming Rides
--
-- Adds 'confirmed' and 'arrived' statuses to the ride_status_check constraint
-- to support the StatusTimeline component progression:
-- Booked (pending) -> Confirmed -> Assigned -> En Route (in_progress) -> Arrived

-- Drop the existing constraint
ALTER TABLE rides DROP CONSTRAINT IF EXISTS ride_status_check;

-- Add the updated constraint with all statuses
ALTER TABLE rides ADD CONSTRAINT ride_status_check
  CHECK (status IN ('pending', 'confirmed', 'assigned', 'in_progress', 'arrived', 'completed', 'cancelled'));

-- Add comment for documentation
COMMENT ON COLUMN rides.status IS 'Ride status: pending (booked), confirmed, assigned, in_progress (en route), arrived, completed, cancelled';
