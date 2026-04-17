-- Migration: 0029_create_driver_credentials
-- Stories 5.3 (onboarding) + 5.9 (credential management).
--
-- Stores driver license, insurance, background check, and vehicle
-- registration records. Each row has issue/expiration dates so the
-- Story 5.9 scheduled job can surface expiring credentials. RLS restricts
-- reads to admins; drivers can see their own via the driver app if/when
-- the driver-side Story 3.11 profile screen surfaces them.

CREATE TABLE IF NOT EXISTS driver_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  credential_type TEXT NOT NULL CHECK (
    credential_type IN (
      'drivers_license',
      'insurance',
      'background_check',
      'vehicle_registration'
    )
  ),
  credential_number TEXT,
  issued_date DATE,
  expiration_date DATE,
  document_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'verified', 'rejected', 'expired')
  ),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_credentials_driver_id
  ON driver_credentials(driver_id);

CREATE INDEX IF NOT EXISTS idx_driver_credentials_expiration_date
  ON driver_credentials(expiration_date) WHERE expiration_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_driver_credentials_status
  ON driver_credentials(verification_status);

ALTER TABLE driver_credentials ENABLE ROW LEVEL SECURITY;

-- Admins can see every credential. Dispatchers can read (needed for the
-- Story 5.10 on-time / fleet overview). Drivers can see their own.
DROP POLICY IF EXISTS "Admins manage driver credentials" ON driver_credentials;
CREATE POLICY "Admins manage driver credentials" ON driver_credentials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub'
        AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub'
        AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Dispatchers read driver credentials" ON driver_credentials;
CREATE POLICY "Dispatchers read driver credentials" ON driver_credentials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub'
        AND u.role = 'dispatcher'
    )
  );

DROP POLICY IF EXISTS "Drivers read own credentials" ON driver_credentials;
CREATE POLICY "Drivers read own credentials" ON driver_credentials
  FOR SELECT USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );
