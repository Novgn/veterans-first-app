-- Migration: 0021_add_ride_fare_and_completed_at
-- Story 3.8: Capture fare + completed_at so drivers can see earnings.
-- fare_cents is nullable (not every ride has a fare set at creation time);
-- completed_at is set when the ride status flips to 'completed'.

ALTER TABLE rides
  ADD COLUMN IF NOT EXISTS fare_cents INTEGER CHECK (fare_cents IS NULL OR fare_cents >= 0),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Auto-stamp completed_at when status transitions to 'completed'
CREATE OR REPLACE FUNCTION stamp_ride_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at := COALESCE(NEW.completed_at, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ride_stamp_completed_at ON rides;
CREATE TRIGGER ride_stamp_completed_at
  BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION stamp_ride_completed_at();

-- Composite index for earnings queries (driver + completed_at range scans)
CREATE INDEX IF NOT EXISTS idx_rides_driver_completed_at
  ON rides(driver_id, completed_at DESC)
  WHERE status = 'completed';
