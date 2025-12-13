-- RLS Policies for driver_profiles and rider_preferences tables
-- Story 2.7: Implement Preferred Driver Selection

-- Enable RLS on driver_profiles
ALTER TABLE "driver_profiles" ENABLE ROW LEVEL SECURITY;

-- Enable RLS on rider_preferences
ALTER TABLE "rider_preferences" ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- driver_profiles policies
-- =============================================================================

-- Drivers can read and update their own profile
CREATE POLICY "driver_profiles_select_own"
ON "driver_profiles"
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

CREATE POLICY "driver_profiles_update_own"
ON "driver_profiles"
FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
)
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

CREATE POLICY "driver_profiles_insert_own"
ON "driver_profiles"
FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

-- Riders can read driver profiles (for driver selection)
CREATE POLICY "driver_profiles_select_for_riders"
ON "driver_profiles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role = 'rider'
  )
  AND is_active = true
);

-- Dispatchers and admins can read all driver profiles
CREATE POLICY "driver_profiles_select_for_dispatchers"
ON "driver_profiles"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role IN ('dispatcher', 'admin')
  )
);

-- Admins can update any driver profile
CREATE POLICY "driver_profiles_update_for_admins"
ON "driver_profiles"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
);

-- =============================================================================
-- rider_preferences policies
-- =============================================================================

-- Riders can read and manage their own preferences
CREATE POLICY "rider_preferences_select_own"
ON "rider_preferences"
FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

CREATE POLICY "rider_preferences_insert_own"
ON "rider_preferences"
FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

CREATE POLICY "rider_preferences_update_own"
ON "rider_preferences"
FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
)
WITH CHECK (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

CREATE POLICY "rider_preferences_delete_own"
ON "rider_preferences"
FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
);

-- Dispatchers can read rider preferences (for matching)
CREATE POLICY "rider_preferences_select_for_dispatchers"
ON "rider_preferences"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE clerk_id = auth.jwt()->>'sub'
    AND role IN ('dispatcher', 'admin')
  )
);

-- Family members can read preferences of linked riders
CREATE POLICY "rider_preferences_select_for_family"
ON "rider_preferences"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM family_links fl
    JOIN users u ON u.id = fl.family_member_id
    WHERE u.clerk_id = auth.jwt()->>'sub'
    AND fl.rider_id = rider_preferences.user_id
    AND fl.status = 'approved'
  )
);
