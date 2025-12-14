-- =============================================================================
-- Audit Logging Trigger Tests (pgTAP format)
-- Story 1.5: Implement Audit Logging Infrastructure
-- =============================================================================
-- Run these tests using: supabase test db
-- =============================================================================

BEGIN;

-- Load pgTAP extension
SELECT * FROM pgtap_version();

-- Plan the number of tests
SELECT plan(7);

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
-- TEST 1: Audit trigger fires on rides INSERT (AC #1, #2)
-- =============================================================================

-- Create test ride
INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000010',
  'pending',
  '100 Test St, Tampa FL',
  'VA Hospital, Tampa FL',
  NOW() + INTERVAL '1 day'
);

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_id = 'a0000000-0000-0000-0000-000000000001'::uuid
        AND action = 'INSERT'
        AND resource_type = 'rides'
    )
  ),
  'Audit trigger fires on rides INSERT (AC #1, #2)'
);

-- Cleanup test 1
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000001'::uuid;
DELETE FROM rides WHERE id = 'a0000000-0000-0000-0000-000000000001'::uuid;

-- =============================================================================
-- TEST 2: Audit trigger captures old/new values on UPDATE (AC #2)
-- =============================================================================

-- Setup: Create a test ride
INSERT INTO rides (id, rider_id, driver_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
VALUES (
  'a0000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000020',
  'pending',
  '100 Test St, Tampa FL',
  'VA Hospital, Tampa FL',
  NOW() + INTERVAL '1 day'
);
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000002'::uuid;

-- Perform update
UPDATE rides SET status = 'assigned' WHERE id = 'a0000000-0000-0000-0000-000000000002'::uuid;

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_id = 'a0000000-0000-0000-0000-000000000002'::uuid
        AND action = 'UPDATE'
        AND old_values->>'status' = 'pending'
        AND new_values->>'status' = 'assigned'
    )
  ),
  'Audit trigger captures old/new values on UPDATE (AC #2)'
);

-- Cleanup test 2
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000002'::uuid;
DELETE FROM rides WHERE id = 'a0000000-0000-0000-0000-000000000002'::uuid;

-- =============================================================================
-- TEST 3: Audit trigger fires on users UPDATE (AC #1)
-- =============================================================================

-- Store original and update
UPDATE users SET first_name = 'JohnTestUpdate' WHERE id = '00000000-0000-0000-0000-000000000010';

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_type = 'users'
        AND resource_id = '00000000-0000-0000-0000-000000000010'::uuid
        AND action = 'UPDATE'
        AND new_values->>'first_name' = 'JohnTestUpdate'
    )
  ),
  'Audit trigger fires on users UPDATE (AC #1)'
);

-- Restore original
UPDATE users SET first_name = 'John' WHERE id = '00000000-0000-0000-0000-000000000010';
DELETE FROM audit_logs WHERE resource_id = '00000000-0000-0000-0000-000000000010'::uuid AND action = 'UPDATE';

-- =============================================================================
-- TEST 4: Audit trigger fires on family_links INSERT (AC #5)
-- =============================================================================

INSERT INTO family_links (id, rider_id, family_member_id, status)
VALUES (
  'a0000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000031',
  'pending'
);

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_type = 'family_links'
        AND resource_id = 'a0000000-0000-0000-0000-000000000004'::uuid
        AND action = 'INSERT'
    )
  ),
  'Audit trigger fires on family_links INSERT (AC #5)'
);

-- Cleanup test 4
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000004'::uuid;
DELETE FROM family_links WHERE id = 'a0000000-0000-0000-0000-000000000004'::uuid;

-- =============================================================================
-- TEST 5: Audit trigger fires on family_links UPDATE (AC #5)
-- =============================================================================

INSERT INTO family_links (id, rider_id, family_member_id, status)
VALUES (
  'a0000000-0000-0000-0000-000000000005'::uuid,
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000031',
  'pending'
);
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000005'::uuid;

UPDATE family_links SET status = 'approved' WHERE id = 'a0000000-0000-0000-0000-000000000005'::uuid;

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_type = 'family_links'
        AND resource_id = 'a0000000-0000-0000-0000-000000000005'::uuid
        AND action = 'UPDATE'
        AND old_values->>'status' = 'pending'
        AND new_values->>'status' = 'approved'
    )
  ),
  'Audit trigger fires on family_links UPDATE (AC #5)'
);

-- Cleanup test 5
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000005'::uuid;
DELETE FROM family_links WHERE id = 'a0000000-0000-0000-0000-000000000005'::uuid;

-- =============================================================================
-- TEST 6: Audit trigger handles NULL user_id (service role) (AC #6)
-- =============================================================================

-- Clear JWT context
SELECT set_config('request.jwt.claims', '', true);

INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
VALUES (
  'a0000000-0000-0000-0000-000000000006'::uuid,
  '00000000-0000-0000-0000-000000000010',
  'pending',
  '100 Service Role Test St, Tampa FL',
  'VA Hospital, Tampa FL',
  NOW() + INTERVAL '1 day'
);

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_id = 'a0000000-0000-0000-0000-000000000006'::uuid
        AND action = 'INSERT'
        AND user_id IS NULL
    )
  ),
  'Audit trigger handles NULL user_id for service role (AC #6)'
);

-- Cleanup test 6
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000006'::uuid;
DELETE FROM rides WHERE id = 'a0000000-0000-0000-0000-000000000006'::uuid;

-- =============================================================================
-- TEST 7: Audit trigger captures DELETE operations (AC #5)
-- =============================================================================

INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
VALUES (
  'a0000000-0000-0000-0000-000000000007'::uuid,
  '00000000-0000-0000-0000-000000000010',
  'cancelled',
  '100 Delete Test St, Tampa FL',
  'VA Hospital, Tampa FL',
  NOW() + INTERVAL '1 day'
);
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000007'::uuid AND action = 'INSERT';

DELETE FROM rides WHERE id = 'a0000000-0000-0000-0000-000000000007'::uuid;

SELECT ok(
  (
    SELECT EXISTS (
      SELECT 1 FROM audit_logs
      WHERE resource_id = 'a0000000-0000-0000-0000-000000000007'::uuid
        AND action = 'DELETE'
        AND old_values IS NOT NULL
        AND new_values IS NULL
    )
  ),
  'Audit trigger captures DELETE operations (AC #5)'
);

-- Cleanup test 7
DELETE FROM audit_logs WHERE resource_id = 'a0000000-0000-0000-0000-000000000007'::uuid;

-- =============================================================================
-- CLEANUP
-- =============================================================================

DROP FUNCTION IF EXISTS test_set_user_context(TEXT);

-- Finish the tests
SELECT * FROM finish();

ROLLBACK;
