-- Migration: Create ride_offers table
-- Story 3.3: Implement Accept/Decline Rides
--
-- Tracks ride offers to drivers with expiration and response status
-- Enables the two-step assignment flow where drivers can accept/decline

-- Create ride_offers table
CREATE TABLE ride_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  offered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE ride_offers IS 'Tracks ride offers to drivers - enables accept/decline flow';
COMMENT ON COLUMN ride_offers.status IS 'Offer status: pending (awaiting response), accepted, declined, expired';
COMMENT ON COLUMN ride_offers.expires_at IS 'When the offer expires if not responded to (default 5 minutes from offer)';
COMMENT ON COLUMN ride_offers.decline_reason IS 'Optional reason provided by driver when declining';

-- Index for quick lookup of pending offers by driver
CREATE INDEX idx_ride_offers_driver_pending
  ON ride_offers(driver_id)
  WHERE status = 'pending';

-- Index for quick lookup of offers by ride
CREATE INDEX idx_ride_offers_ride_id
  ON ride_offers(ride_id);

-- Enable RLS
ALTER TABLE ride_offers ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can view their own offers
CREATE POLICY "Drivers can view own offers" ON ride_offers
  FOR SELECT USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- Policy: Drivers can update their own pending offers (accept/decline)
CREATE POLICY "Drivers can update own pending offers" ON ride_offers
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    AND status = 'pending'
  );

-- Policy: Dispatchers and admins can view all offers
CREATE POLICY "Dispatchers can view all offers" ON ride_offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
      AND role IN ('dispatcher', 'admin')
    )
  );

-- Policy: Dispatchers and admins can insert offers (assign rides to drivers)
CREATE POLICY "Dispatchers can create offers" ON ride_offers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
      AND role IN ('dispatcher', 'admin')
    )
  );

-- Policy: System can update offers (for expiration handling)
CREATE POLICY "System can update offers" ON ride_offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
      AND role = 'admin'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_ride_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ride_offers_updated_at
  BEFORE UPDATE ON ride_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_ride_offers_updated_at();
