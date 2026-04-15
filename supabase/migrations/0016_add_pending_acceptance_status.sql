-- Migration: Add pending_acceptance ride status
-- Story 3.3: Implement Accept/Decline Rides
--
-- Adds 'pending_acceptance' status to the ride_status_check constraint
-- to support the two-step assignment flow: dispatch offers -> driver accepts
--
-- Ride status flow:
-- pending -> confirmed -> pending_acceptance -> assigned -> in_progress -> arrived -> completed
--                              |
--                              v (declined/expired)
--                          confirmed (returns to pool)

-- Drop the existing constraint
ALTER TABLE rides DROP CONSTRAINT IF EXISTS ride_status_check;

-- Add the updated constraint with pending_acceptance status
ALTER TABLE rides ADD CONSTRAINT ride_status_check
  CHECK (status IN ('pending', 'confirmed', 'pending_acceptance', 'assigned', 'in_progress', 'arrived', 'completed', 'cancelled'));

-- Update column comment for documentation
COMMENT ON COLUMN rides.status IS 'Ride status: pending (booked), confirmed (ready for dispatch), pending_acceptance (offered to driver), assigned (driver accepted), in_progress (en route), arrived, completed, cancelled';
