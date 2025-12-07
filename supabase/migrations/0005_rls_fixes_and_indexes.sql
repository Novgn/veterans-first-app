-- =============================================================================
-- RLS Fixes, Performance Indexes, and Test Helpers
-- Story 1.4: Implement Role-Based Access Control (RBAC) - Code Review Fixes
-- =============================================================================

-- =============================================================================
-- FIX 1: Add riders UPDATE policy for rides table
-- Riders should be able to update their own rides (e.g., cancel, modify pickup time)
-- =============================================================================

-- Drop the existing rides_update_policy and recreate with rider access
DROP POLICY IF EXISTS "rides_update_policy" ON rides;

CREATE POLICY "rides_update_policy" ON rides
  FOR UPDATE TO authenticated
  USING (
    -- Rider can update their own rides (e.g., cancel, reschedule)
    (get_user_role() = 'rider' AND rider_id = get_current_user_id())
    OR
    -- Driver can update rides assigned to them
    (get_user_role() = 'driver' AND driver_id = get_current_user_id())
    OR
    -- Dispatcher can update any ride
    get_user_role() = 'dispatcher'
    OR
    -- Admin can update any ride
    get_user_role() = 'admin'
  )
  WITH CHECK (
    (get_user_role() = 'rider' AND rider_id = get_current_user_id())
    OR
    (get_user_role() = 'driver' AND driver_id = get_current_user_id())
    OR
    get_user_role() IN ('dispatcher', 'admin')
  );

-- =============================================================================
-- FIX 2: Add performance indexes for RLS FK columns
-- These indexes improve RLS policy performance for foreign key lookups
-- =============================================================================

-- Index on rides.rider_id for rider role queries
CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON rides(rider_id);

-- Index on rides.driver_id for driver role queries
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);

-- Index on rides.status for driver role status filtering
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);

-- Composite index for driver role queries (driver_id + status)
CREATE INDEX IF NOT EXISTS idx_rides_driver_status ON rides(driver_id, status);

-- Index on family_links.family_member_id for family role queries
CREATE INDEX IF NOT EXISTS idx_family_links_family_member_id ON family_links(family_member_id);

-- Index on family_links.rider_id for rider queries
CREATE INDEX IF NOT EXISTS idx_family_links_rider_id ON family_links(rider_id);

-- Composite index for family link status checks
CREATE INDEX IF NOT EXISTS idx_family_links_status ON family_links(rider_id, family_member_id, status);

-- Index on users.clerk_id for JWT auth lookups (critical for RLS performance)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Index on users.role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =============================================================================
-- FIX 3: Test Helper RPC Functions for TypeScript Integration Tests
-- These functions allow proper JWT simulation in tests
-- =============================================================================

-- Function to create test helpers (called in beforeAll)
CREATE OR REPLACE FUNCTION create_rls_test_helpers()
RETURNS VOID AS $$
BEGIN
  -- Create function to query as a specific user
  EXECUTE $func$
    CREATE OR REPLACE FUNCTION test_query_as_user(
      p_clerk_id TEXT,
      p_table_name TEXT,
      p_columns TEXT DEFAULT '*'
    )
    RETURNS JSONB AS $inner$
    DECLARE
      result JSONB;
    BEGIN
      -- Set the JWT context for this query
      PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);

      -- Execute dynamic query
      EXECUTE format('SELECT jsonb_agg(row_to_json(t)) FROM (SELECT %I FROM %I) t', p_columns, p_table_name)
      INTO result;

      RETURN COALESCE(result, '[]'::jsonb);
    END;
    $inner$ LANGUAGE plpgsql SECURITY DEFINER;
  $func$;

  -- Create function to count as a specific user
  EXECUTE $func$
    CREATE OR REPLACE FUNCTION test_count_as_user(
      p_clerk_id TEXT,
      p_table_name TEXT
    )
    RETURNS INTEGER AS $inner$
    DECLARE
      result INTEGER;
    BEGIN
      -- Set the JWT context for this query
      PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);

      -- Execute count query
      EXECUTE format('SELECT COUNT(*)::INTEGER FROM %I', p_table_name)
      INTO result;

      RETURN result;
    END;
    $inner$ LANGUAGE plpgsql SECURITY DEFINER;
  $func$;
END;
$$ LANGUAGE plpgsql;

-- Function to drop test helpers (called in afterAll)
CREATE OR REPLACE FUNCTION drop_rls_test_helpers()
RETURNS VOID AS $$
BEGIN
  DROP FUNCTION IF EXISTS test_query_as_user(TEXT, TEXT, TEXT);
  DROP FUNCTION IF EXISTS test_count_as_user(TEXT, TEXT);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON INDEX idx_rides_rider_id IS 'Performance index for RLS rider role queries';
COMMENT ON INDEX idx_rides_driver_id IS 'Performance index for RLS driver role queries';
COMMENT ON INDEX idx_rides_driver_status IS 'Composite index for driver RLS (driver_id + status)';
COMMENT ON INDEX idx_users_clerk_id IS 'Critical index for JWT auth lookups in RLS policies';
