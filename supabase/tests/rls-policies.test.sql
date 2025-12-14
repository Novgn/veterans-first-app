-- =============================================================================
-- RLS Policy Tests for Veterans First App (pgTAP format)
-- Story 1.4: Implement Role-Based Access Control (RBAC)
-- =============================================================================
-- Run these tests using: supabase test db
-- =============================================================================

BEGIN;

-- Load pgTAP extension
SELECT * FROM pgtap_version();

-- Plan the number of tests
SELECT plan(8);

-- =============================================================================
-- SETUP: Create helper function to simulate user context
-- =============================================================================

CREATE OR REPLACE FUNCTION test_set_user_context(p_clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TEST 1: Admin can see all data (AC #5)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_admin_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 8 FROM users),
  'Admin can see all 8 users (AC #5)'
);

RESET ROLE;

-- =============================================================================
-- TEST 2: Dispatcher can see all users and rides (AC #4)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_dispatcher_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 7 FROM rides),
  'Dispatcher can see all 7 rides (AC #4)'
);

RESET ROLE;

-- =============================================================================
-- TEST 3: Rider can only see own profile and rides (AC #1)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_rider_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 1 FROM users),
  'Rider can only see own profile (AC #1)'
);

RESET ROLE;

-- =============================================================================
-- TEST 4: Rider sees only their rides (AC #1)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_rider_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 4 FROM rides),
  'Rider John sees 4 rides (AC #1)'
);

RESET ROLE;

-- =============================================================================
-- TEST 5: Driver can only see assigned/in_progress rides (AC #2)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_driver_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 2 FROM rides),
  'Driver Mike sees 2 rides (assigned + in_progress) (AC #2)'
);

RESET ROLE;

-- =============================================================================
-- TEST 6: Family member can see linked rider rides (AC #3)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_family_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 7 FROM rides),
  'Family Bob sees 7 rides from linked riders (AC #3)'
);

RESET ROLE;

-- =============================================================================
-- TEST 7: Family member with pending link sees no rides
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_family_002')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 0 FROM rides),
  'Family Alice with pending link sees 0 rides'
);

RESET ROLE;

-- =============================================================================
-- TEST 8: Audit logs restricted to admin (AC #8)
-- =============================================================================

SELECT set_config('request.jwt.claims', json_build_object('sub', 'test_rider_001')::text, true);
SET LOCAL ROLE authenticated;

SELECT ok(
  (SELECT COUNT(*) = 0 FROM audit_logs),
  'Non-admin cannot read audit logs (AC #8)'
);

RESET ROLE;

-- =============================================================================
-- CLEANUP
-- =============================================================================

DROP FUNCTION IF EXISTS test_set_user_context(TEXT);

-- Finish the tests
SELECT * FROM finish();

ROLLBACK;
