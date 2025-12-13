-- Migration: 0012_driver_locations.sql
-- Story 2.10: Implement Real-Time Driver Tracking
-- FR11: Riders can track their driver's real-time location and estimated arrival time

-- Create driver_locations table for real-time GPS tracking
CREATE TABLE driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),  -- Direction in degrees (0-360)
  accuracy DECIMAL(6, 2), -- GPS accuracy in meters
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient lookups by driver (most common query pattern)
CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);

-- Index for time-based queries (get latest location)
CREATE INDEX idx_driver_locations_recorded_at ON driver_locations(recorded_at DESC);

-- Composite index for getting latest location by driver
CREATE INDEX idx_driver_locations_driver_recorded ON driver_locations(driver_id, recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can insert their own location
CREATE POLICY "Drivers can insert own location"
  ON driver_locations
  FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- Policy: Drivers can view their own location history
CREATE POLICY "Drivers can view own location"
  ON driver_locations
  FOR SELECT
  USING (auth.uid() = driver_id);

-- Policy: Riders can view their assigned driver's location
-- Only when ride is in active status (assigned, en_route, arrived, in_progress)
CREATE POLICY "Riders can view assigned driver location"
  ON driver_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rides
      WHERE rides.driver_id = driver_locations.driver_id
      AND rides.rider_id = auth.uid()
      AND rides.status IN ('assigned', 'en_route', 'arrived', 'in_progress')
    )
  );

-- Policy: Dispatchers and admins can view all driver locations
CREATE POLICY "Admins can view all driver locations"
  ON driver_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('dispatcher', 'admin')
    )
  );

-- Enable Realtime for this table (required for Supabase Realtime subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;

-- Add comment for documentation
COMMENT ON TABLE driver_locations IS 'Real-time GPS location tracking for drivers. Used for rider tracking (FR11) and fleet management.';
COMMENT ON COLUMN driver_locations.heading IS 'Direction of travel in degrees (0-360), where 0 is north';
COMMENT ON COLUMN driver_locations.accuracy IS 'GPS accuracy in meters - lower is more accurate';
