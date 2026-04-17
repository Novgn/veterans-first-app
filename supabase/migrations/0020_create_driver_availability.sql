-- Migration: 0020_create_driver_availability
-- Story 3.7: Recurring weekly availability windows for drivers.

CREATE TABLE IF NOT EXISTS driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day_of_week SMALLINT NOT NULL,     -- 0 = Sunday .. 6 = Saturday
  start_time TIME NOT NULL,           -- local clock time, inclusive
  end_time TIME NOT NULL,             -- local clock time, exclusive
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT driver_availability_day_range CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT driver_availability_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_driver_availability_driver_id
  ON driver_availability(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_availability_day
  ON driver_availability(driver_id, day_of_week);

ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;

-- Drivers manage their own rows
CREATE POLICY "Drivers view own availability" ON driver_availability
  FOR SELECT USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Drivers insert own availability" ON driver_availability
  FOR INSERT WITH CHECK (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Drivers update own availability" ON driver_availability
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Drivers delete own availability" ON driver_availability
  FOR DELETE USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- Dispatchers / admins see all windows (needed for ride assignment Story 3.14)
CREATE POLICY "Dispatchers view all availability" ON driver_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
        AND role IN ('dispatcher', 'admin')
    )
  );
