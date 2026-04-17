-- Migration: 0031_create_system_config
-- Stories 5.13 (service area), 5.14 (pricing), 5.15 (operating hours).
--
-- A single key/value config table so system-wide settings can evolve
-- without a migration per setting. Only admins can mutate; every
-- authenticated user can SELECT so the booking flow can read pricing +
-- service area without a service-role round-trip.

CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_config_config_key ON system_config(config_key);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads system config" ON system_config;
CREATE POLICY "Anyone reads system config" ON system_config
  FOR SELECT USING (auth.jwt()->>'sub' IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage system config" ON system_config;
CREATE POLICY "Admins manage system config" ON system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  );

-- Seed the default config values so the app has something to read on day
-- one. Admins can update/overwrite these via the settings UI from
-- Stories 5.13–5.15.
INSERT INTO system_config (config_key, config_value, description) VALUES
  (
    'pricing',
    '{"base_cents": 500, "per_mile_cents": 150, "per_wait_minute_cents": 25, "included_wait_minutes": 20, "minimum_fare_cents": 1000}'::jsonb,
    'Ride pricing parameters (Story 5.14).'
  ),
  (
    'service_area',
    '{"type": "Polygon", "coordinates": []}'::jsonb,
    'GeoJSON polygon defining the service area (Story 5.13).'
  ),
  (
    'operating_hours',
    '{"monday": {"open": "06:00", "close": "20:00"}, "tuesday": {"open": "06:00", "close": "20:00"}, "wednesday": {"open": "06:00", "close": "20:00"}, "thursday": {"open": "06:00", "close": "20:00"}, "friday": {"open": "06:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": null, "holidays": []}'::jsonb,
    'Operating days and hours (Story 5.15).'
  )
ON CONFLICT (config_key) DO NOTHING;
