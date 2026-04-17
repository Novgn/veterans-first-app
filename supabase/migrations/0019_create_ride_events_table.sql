-- Migration: 0019_create_ride_events_table
-- Story 3.4: Track all trip status transitions with timestamp and GPS location
-- FR22, FR47 (pickup time), FR48 (dropoff time)

CREATE TABLE IF NOT EXISTS ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  driver_id UUID REFERENCES users(id),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ride_event_type_check CHECK (
    event_type IN (
      'en_route',
      'arrived',
      'trip_started',
      'trip_completed',
      'no_show',
      'cancelled'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_ride_events_ride_id ON ride_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_events_driver_id ON ride_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_events_created_at ON ride_events(created_at DESC);

ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;

-- Drivers can view events for rides they are assigned to
CREATE POLICY "Drivers can view own ride events" ON ride_events
  FOR SELECT USING (
    ride_id IN (
      SELECT id FROM rides
      WHERE driver_id IN (
        SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
      )
    )
  );

-- Drivers can insert events only for their own assigned rides
CREATE POLICY "Drivers can insert events for assigned rides" ON ride_events
  FOR INSERT WITH CHECK (
    ride_id IN (
      SELECT id FROM rides
      WHERE driver_id IN (
        SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
      )
    )
  );

-- Dispatchers and admins can view all ride events
CREATE POLICY "Dispatchers can view all ride events" ON ride_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
        AND role IN ('dispatcher', 'admin')
    )
  );

-- Riders can view events for their own rides
CREATE POLICY "Riders can view own ride events" ON ride_events
  FOR SELECT USING (
    ride_id IN (
      SELECT id FROM rides
      WHERE rider_id IN (
        SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
      )
    )
  );

-- Audit trigger: log to audit_logs on each insert
CREATE OR REPLACE FUNCTION log_ride_event() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (
    NEW.driver_id,
    'CREATE',
    'ride_event',
    NEW.id,
    jsonb_build_object(
      'event_type', NEW.event_type,
      'ride_id', NEW.ride_id,
      'lat', NEW.lat,
      'lng', NEW.lng
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ride_event_audit_trigger ON ride_events;
CREATE TRIGGER ride_event_audit_trigger
  AFTER INSERT ON ride_events
  FOR EACH ROW EXECUTE FUNCTION log_ride_event();
