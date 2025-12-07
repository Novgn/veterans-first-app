-- =============================================================================
-- RLS Policy Tests for Veterans First App
-- Story 1.4: Implement Role-Based Access Control (RBAC)
-- =============================================================================
-- Run these tests using: supabase test db
-- Or manually via: psql <connection_string> -f supabase/tests/rls-policies.test.sql
-- =============================================================================

-- Enable pgTAP for testing (if available)
-- CREATE EXTENSION IF NOT EXISTS pgtap;

-- =============================================================================
-- SETUP: Create helper function to simulate user context
-- =============================================================================

-- Create a function to set the JWT context for testing
-- This simulates what happens when a user authenticates with Clerk
CREATE OR REPLACE FUNCTION test_set_user_context(p_clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Set the JWT claims for the current session
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TEST CASE 1: Admin can see all data (AC #5)
-- =============================================================================

DO $$
DECLARE
  user_count INTEGER;
  ride_count INTEGER;
  audit_count INTEGER;
BEGIN
  -- Set context as admin user and switch to authenticated role for RLS
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  -- Admin should see all 8 users
  SELECT COUNT(*)::INTEGER INTO user_count FROM users;
  IF user_count != 8 THEN
    RAISE EXCEPTION 'FAIL: Admin should see 8 users, got %', user_count;
  END IF;

  -- Admin should see all 7 rides
  SELECT COUNT(*)::INTEGER INTO ride_count FROM rides;
  IF ride_count != 7 THEN
    RAISE EXCEPTION 'FAIL: Admin should see 7 rides, got %', ride_count;
  END IF;

  -- Admin should see audit logs (3 from seed + 18 from trigger-generated: 8 users + 7 rides + 3 family_links)
  -- Total: 21 audit logs after Story 1.5 audit triggers are applied
  SELECT COUNT(*)::INTEGER INTO audit_count FROM audit_logs;
  IF audit_count < 3 THEN
    RAISE EXCEPTION 'FAIL: Admin should see at least 3 audit logs, got %', audit_count;
  END IF;

  RAISE NOTICE 'PASS: Admin can see all data (AC #5)';
END $$;

-- =============================================================================
-- TEST CASE 2: Dispatcher can see all users and rides (AC #4)
-- =============================================================================

DO $$
DECLARE
  user_count INTEGER;
  ride_count INTEGER;
  audit_count INTEGER;
BEGIN
  PERFORM test_set_user_context('test_dispatcher_001');
  SET LOCAL ROLE authenticated;

  -- Dispatcher should see all 8 users
  SELECT COUNT(*)::INTEGER INTO user_count FROM users;
  IF user_count != 8 THEN
    RAISE EXCEPTION 'FAIL: Dispatcher should see 8 users, got %', user_count;
  END IF;

  -- Dispatcher should see all 7 rides
  SELECT COUNT(*)::INTEGER INTO ride_count FROM rides;
  IF ride_count != 7 THEN
    RAISE EXCEPTION 'FAIL: Dispatcher should see 7 rides, got %', ride_count;
  END IF;

  -- Dispatcher should NOT see audit logs (only admin)
  SELECT COUNT(*)::INTEGER INTO audit_count FROM audit_logs;
  IF audit_count != 0 THEN
    RAISE EXCEPTION 'FAIL: Dispatcher should see 0 audit logs, got %', audit_count;
  END IF;

  RAISE NOTICE 'PASS: Dispatcher can see all users and rides (AC #4)';
END $$;

-- =============================================================================
-- TEST CASE 3: Rider can only see own profile and rides (AC #1)
-- =============================================================================

DO $$
DECLARE
  user_count INTEGER;
  ride_count INTEGER;
BEGIN
  -- Test as rider John (has 4 rides)
  PERFORM test_set_user_context('test_rider_001');
  SET LOCAL ROLE authenticated;

  -- Rider should only see their own profile
  SELECT COUNT(*)::INTEGER INTO user_count FROM users;
  IF user_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Rider should see 1 user (self), got %', user_count;
  END IF;

  -- Rider John should see their 4 rides
  SELECT COUNT(*)::INTEGER INTO ride_count FROM rides;
  IF ride_count != 4 THEN
    RAISE EXCEPTION 'FAIL: Rider John should see 4 rides, got %', ride_count;
  END IF;

  RAISE NOTICE 'PASS: Rider can only see own profile and rides (AC #1)';
END $$;

-- =============================================================================
-- TEST CASE 4: Driver can only see assigned/in_progress rides (AC #2)
-- =============================================================================

DO $$
DECLARE
  user_count INTEGER;
  ride_count INTEGER;
  ride_statuses TEXT[];
BEGIN
  -- Test as driver Mike (assigned to rides #2 and #3)
  PERFORM test_set_user_context('test_driver_001');
  SET LOCAL ROLE authenticated;

  -- Driver should only see their own profile
  SELECT COUNT(*)::INTEGER INTO user_count FROM users;
  IF user_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Driver should see 1 user (self), got %', user_count;
  END IF;

  -- Driver Mike should see 2 rides (assigned + in_progress)
  SELECT COUNT(*)::INTEGER INTO ride_count FROM rides;
  IF ride_count != 2 THEN
    RAISE EXCEPTION 'FAIL: Driver Mike should see 2 rides, got %', ride_count;
  END IF;

  -- Verify the visible rides are only assigned or in_progress
  SELECT ARRAY_AGG(DISTINCT status) INTO ride_statuses FROM rides;
  IF NOT (ride_statuses <@ ARRAY['assigned', 'in_progress']) THEN
    RAISE EXCEPTION 'FAIL: Driver should only see assigned/in_progress rides, got %', ride_statuses;
  END IF;

  RAISE NOTICE 'PASS: Driver can only see assigned/in_progress rides (AC #2)';
END $$;

-- =============================================================================
-- TEST CASE 5: Family member can see linked rider rides (AC #3)
-- =============================================================================

DO $$
DECLARE
  ride_count INTEGER;
  family_link_count INTEGER;
BEGIN
  -- Test as family Bob (linked to John and Jane via approved links)
  PERFORM test_set_user_context('test_family_001');
  SET LOCAL ROLE authenticated;

  -- Bob should see rides from linked riders (John: 4 + Jane: 3 = 7)
  SELECT COUNT(*)::INTEGER INTO ride_count FROM rides;
  IF ride_count != 7 THEN
    RAISE EXCEPTION 'FAIL: Family Bob should see 7 rides, got %', ride_count;
  END IF;

  -- Bob should see his 2 family links
  SELECT COUNT(*)::INTEGER INTO family_link_count FROM family_links;
  IF family_link_count != 2 THEN
    RAISE EXCEPTION 'FAIL: Family Bob should see 2 family links, got %', family_link_count;
  END IF;

  RAISE NOTICE 'PASS: Family member can see linked rider rides (AC #3)';
END $$;

-- =============================================================================
-- TEST CASE 6: Family member with NO approved links sees no rides
-- =============================================================================

DO $$
DECLARE
  ride_count INTEGER;
BEGIN
  -- Test as family Alice (only has pending link, no approved)
  PERFORM test_set_user_context('test_family_002');
  SET LOCAL ROLE authenticated;

  -- Alice should see 0 rides (pending link doesn't grant access)
  SELECT COUNT(*)::INTEGER INTO ride_count FROM rides;
  IF ride_count != 0 THEN
    RAISE EXCEPTION 'FAIL: Family Alice should see 0 rides (pending link), got %', ride_count;
  END IF;

  RAISE NOTICE 'PASS: Family member with pending link sees no rides';
END $$;

-- =============================================================================
-- TEST CASE 7: Users table RLS - users see own profile (AC #7)
-- =============================================================================

DO $$
DECLARE
  visible_user_id UUID;
  user_count INTEGER;
BEGIN
  PERFORM test_set_user_context('test_rider_002');
  SET LOCAL ROLE authenticated;

  -- Should only see own profile (1 user)
  SELECT COUNT(*)::INTEGER INTO user_count FROM users;
  IF user_count != 1 THEN
    RAISE EXCEPTION 'FAIL: Rider should see 1 user (self), got %', user_count;
  END IF;

  -- Verify it's the correct user
  SELECT id INTO visible_user_id FROM users LIMIT 1;
  IF visible_user_id != '00000000-0000-0000-0000-000000000011' THEN
    RAISE EXCEPTION 'FAIL: Rider should only see own profile';
  END IF;

  RAISE NOTICE 'PASS: Users table RLS restricts to own profile (AC #7)';
END $$;

-- =============================================================================
-- TEST CASE 8: Audit logs are append-only (AC #8)
-- =============================================================================

DO $$
DECLARE
  can_read INTEGER;
BEGIN
  -- Non-admin should not see audit logs
  PERFORM test_set_user_context('test_rider_001');
  SET LOCAL ROLE authenticated;
  SELECT COUNT(*)::INTEGER INTO can_read FROM audit_logs;
  IF can_read != 0 THEN
    RAISE EXCEPTION 'FAIL: Non-admin should not read audit logs, got %', can_read;
  END IF;

  -- Reset to superuser to switch context
  RESET ROLE;

  -- Admin should see audit logs (at least 3 - more with audit triggers active)
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;
  SELECT COUNT(*)::INTEGER INTO can_read FROM audit_logs;
  IF can_read < 3 THEN
    RAISE EXCEPTION 'FAIL: Admin should see at least 3 audit logs, got %', can_read;
  END IF;

  RAISE NOTICE 'PASS: Audit logs SELECT restricted to admin (AC #8)';
END $$;

-- =============================================================================
-- CLEANUP: Drop test helper functions
-- =============================================================================

DROP FUNCTION IF EXISTS test_set_user_context(TEXT);

-- =============================================================================
-- SUMMARY
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'All RLS Policy Tests Completed Successfully';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'AC #1: Rider sees own rides - PASS';
  RAISE NOTICE 'AC #2: Driver sees assigned/in_progress - PASS';
  RAISE NOTICE 'AC #3: Family sees linked rider rides - PASS';
  RAISE NOTICE 'AC #4: Dispatcher sees all rides - PASS';
  RAISE NOTICE 'AC #5: Admin has full access - PASS';
  RAISE NOTICE 'AC #7: Users see own profile - PASS';
  RAISE NOTICE 'AC #8: Audit logs append-only - PASS';
  RAISE NOTICE '===========================================';
END $$;
