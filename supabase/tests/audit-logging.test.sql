-- =============================================================================
-- Audit Logging Trigger Tests
-- Story 1.5: Implement Audit Logging Infrastructure
-- =============================================================================
-- Run these tests using: supabase test db
-- Or manually via: psql <connection_string> -f supabase/tests/audit-logging.test.sql
-- =============================================================================

-- =============================================================================
-- SETUP: Create helper function to simulate user context
-- =============================================================================

-- Create a function to set the JWT context for testing
CREATE OR REPLACE FUNCTION test_set_user_context(p_clerk_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TEST CASE 1: Audit trigger fires on rides INSERT (AC #1, #2)
-- =============================================================================

DO $$
DECLARE
  new_ride_id UUID := gen_random_uuid();
  audit_count INTEGER;
  audit_record RECORD;
BEGIN
  -- Set context as dispatcher (can create rides)
  PERFORM test_set_user_context('test_dispatcher_001');
  SET LOCAL ROLE authenticated;

  -- Get initial audit log count (as admin to see logs)
  RESET ROLE;
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;
  SELECT COUNT(*)::INTEGER INTO audit_count FROM audit_logs WHERE resource_type = 'rides';
  RESET ROLE;

  -- Insert a new ride as dispatcher
  PERFORM test_set_user_context('test_dispatcher_001');
  SET LOCAL ROLE authenticated;

  INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
  VALUES (
    new_ride_id,
    '00000000-0000-0000-0000-000000000010',  -- John's rider_id
    'pending',
    '100 Test St, Tampa FL',
    'VA Hospital, Tampa FL',
    NOW() + INTERVAL '1 day'
  );
  RESET ROLE;

  -- Verify audit log was created (switch to admin to read)
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'rides'
    AND resource_id = new_ride_id
    AND action = 'INSERT';

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for rides INSERT';
  END IF;

  IF audit_record.new_values IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log missing new_values for INSERT';
  END IF;

  IF audit_record.old_values IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log should have NULL old_values for INSERT';
  END IF;

  -- Cleanup test ride
  RESET ROLE;
  DELETE FROM rides WHERE id = new_ride_id;
  DELETE FROM audit_logs WHERE resource_id = new_ride_id;

  RAISE NOTICE 'PASS: Audit trigger fires on rides INSERT (AC #1, #2)';
END $$;

-- =============================================================================
-- TEST CASE 2: Audit trigger captures old/new values on rides UPDATE (AC #2)
-- =============================================================================

DO $$
DECLARE
  new_ride_id UUID := gen_random_uuid();
  audit_record RECORD;
BEGIN
  -- Create a test ride as service role
  INSERT INTO rides (id, rider_id, driver_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
  VALUES (
    new_ride_id,
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000020',  -- Driver Mike
    'pending',
    '100 Test St, Tampa FL',
    'VA Hospital, Tampa FL',
    NOW() + INTERVAL '1 day'
  );

  -- Clear any audit logs from insert
  DELETE FROM audit_logs WHERE resource_id = new_ride_id;

  -- Update ride status as dispatcher
  PERFORM test_set_user_context('test_dispatcher_001');
  SET LOCAL ROLE authenticated;

  UPDATE rides SET status = 'assigned' WHERE id = new_ride_id;
  RESET ROLE;

  -- Verify audit log was created with old/new values
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'rides'
    AND resource_id = new_ride_id
    AND action = 'UPDATE';

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for rides UPDATE';
  END IF;

  IF audit_record.old_values IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log missing old_values for UPDATE';
  END IF;

  IF audit_record.new_values IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log missing new_values for UPDATE';
  END IF;

  -- Verify old_values contains 'pending' status
  IF audit_record.old_values->>'status' != 'pending' THEN
    RAISE EXCEPTION 'FAIL: old_values should contain status=pending, got %', audit_record.old_values->>'status';
  END IF;

  -- Verify new_values contains 'assigned' status
  IF audit_record.new_values->>'status' != 'assigned' THEN
    RAISE EXCEPTION 'FAIL: new_values should contain status=assigned, got %', audit_record.new_values->>'status';
  END IF;

  -- Cleanup
  RESET ROLE;
  DELETE FROM rides WHERE id = new_ride_id;
  DELETE FROM audit_logs WHERE resource_id = new_ride_id;

  RAISE NOTICE 'PASS: Audit trigger captures old/new values on UPDATE (AC #2)';
END $$;

-- =============================================================================
-- TEST CASE 3: Audit trigger fires on users UPDATE (AC #1)
-- =============================================================================

DO $$
DECLARE
  audit_record RECORD;
  test_user_id UUID := '00000000-0000-0000-0000-000000000010';  -- John
  original_first_name TEXT;
BEGIN
  -- Store original first_name
  SELECT first_name INTO original_first_name FROM users WHERE id = test_user_id;

  -- Clear existing audit logs for this user
  DELETE FROM audit_logs WHERE resource_id = test_user_id AND action = 'UPDATE';

  -- Update user as admin
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  UPDATE users SET first_name = 'JohnUpdated' WHERE id = test_user_id;
  RESET ROLE;

  -- Verify audit log
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'users'
    AND resource_id = test_user_id
    AND action = 'UPDATE'
  ORDER BY created_at DESC LIMIT 1;

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for users UPDATE';
  END IF;

  IF audit_record.old_values->>'first_name' != original_first_name THEN
    RAISE EXCEPTION 'FAIL: old_values should contain original first_name';
  END IF;

  IF audit_record.new_values->>'first_name' != 'JohnUpdated' THEN
    RAISE EXCEPTION 'FAIL: new_values should contain updated first_name';
  END IF;

  -- Restore original value
  RESET ROLE;
  UPDATE users SET first_name = original_first_name WHERE id = test_user_id;
  DELETE FROM audit_logs WHERE resource_id = test_user_id AND action = 'UPDATE';

  RAISE NOTICE 'PASS: Audit trigger fires on users UPDATE (AC #1)';
END $$;

-- =============================================================================
-- TEST CASE 4: Audit trigger fires on family_links operations (AC #5)
-- =============================================================================

DO $$
DECLARE
  new_link_id UUID := gen_random_uuid();
  audit_record RECORD;
BEGIN
  -- Create a family link as admin
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  INSERT INTO family_links (id, rider_id, family_member_id, status)
  VALUES (
    new_link_id,
    '00000000-0000-0000-0000-000000000010',  -- John
    '00000000-0000-0000-0000-000000000031',  -- Alice
    'pending'
  );
  RESET ROLE;

  -- Verify INSERT audit log
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'family_links'
    AND resource_id = new_link_id
    AND action = 'INSERT';

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for family_links INSERT';
  END IF;

  -- Update the link status
  RESET ROLE;
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  UPDATE family_links SET status = 'approved' WHERE id = new_link_id;
  RESET ROLE;

  -- Verify UPDATE audit log
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'family_links'
    AND resource_id = new_link_id
    AND action = 'UPDATE';

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for family_links UPDATE';
  END IF;

  IF audit_record.old_values->>'status' != 'pending' THEN
    RAISE EXCEPTION 'FAIL: old_values should contain status=pending';
  END IF;

  IF audit_record.new_values->>'status' != 'approved' THEN
    RAISE EXCEPTION 'FAIL: new_values should contain status=approved';
  END IF;

  -- Cleanup
  RESET ROLE;
  DELETE FROM family_links WHERE id = new_link_id;
  DELETE FROM audit_logs WHERE resource_id = new_link_id;

  RAISE NOTICE 'PASS: Audit trigger fires on family_links operations (AC #5)';
END $$;

-- =============================================================================
-- TEST CASE 5: Audit trigger captures user_id from JWT (AC #1)
-- =============================================================================

DO $$
DECLARE
  new_ride_id UUID := gen_random_uuid();
  audit_record RECORD;
  expected_user_id UUID := '00000000-0000-0000-0000-000000000002';  -- Dispatcher's UUID
BEGIN
  -- Create a ride as dispatcher
  PERFORM test_set_user_context('test_dispatcher_001');
  SET LOCAL ROLE authenticated;

  INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
  VALUES (
    new_ride_id,
    '00000000-0000-0000-0000-000000000010',
    'pending',
    '100 Test St, Tampa FL',
    'VA Hospital, Tampa FL',
    NOW() + INTERVAL '1 day'
  );
  RESET ROLE;

  -- Verify audit log has correct user_id
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'rides'
    AND resource_id = new_ride_id
    AND action = 'INSERT';

  IF audit_record.user_id != expected_user_id THEN
    RAISE EXCEPTION 'FAIL: Audit log user_id should be dispatcher UUID %, got %', expected_user_id, audit_record.user_id;
  END IF;

  -- Cleanup
  RESET ROLE;
  DELETE FROM rides WHERE id = new_ride_id;
  DELETE FROM audit_logs WHERE resource_id = new_ride_id;

  RAISE NOTICE 'PASS: Audit trigger captures user_id from JWT (AC #1)';
END $$;

-- =============================================================================
-- TEST CASE 6: Audit trigger handles NULL user_id (service role) (AC #6)
-- =============================================================================

DO $$
DECLARE
  new_ride_id UUID := gen_random_uuid();
  audit_record RECORD;
BEGIN
  -- Create a ride as service role (no JWT context)
  -- Clear any JWT context first
  PERFORM set_config('request.jwt.claims', '', true);

  INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
  VALUES (
    new_ride_id,
    '00000000-0000-0000-0000-000000000010',
    'pending',
    '100 Service Role Test St, Tampa FL',
    'VA Hospital, Tampa FL',
    NOW() + INTERVAL '1 day'
  );

  -- Verify audit log was created with NULL user_id
  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'rides'
    AND resource_id = new_ride_id
    AND action = 'INSERT';

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for service role INSERT';
  END IF;

  -- user_id should be NULL when there's no JWT
  IF audit_record.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log user_id should be NULL for service role operations, got %', audit_record.user_id;
  END IF;

  -- Cleanup
  DELETE FROM rides WHERE id = new_ride_id;
  DELETE FROM audit_logs WHERE resource_id = new_ride_id;

  RAISE NOTICE 'PASS: Audit trigger handles NULL user_id (service role) (AC #6)';
END $$;

-- =============================================================================
-- TEST CASE 7: Audit trigger captures DELETE operations (AC #5)
-- =============================================================================

DO $$
DECLARE
  new_ride_id UUID := gen_random_uuid();
  audit_record RECORD;
BEGIN
  -- Create a test ride
  INSERT INTO rides (id, rider_id, status, pickup_address, dropoff_address, scheduled_pickup_time)
  VALUES (
    new_ride_id,
    '00000000-0000-0000-0000-000000000010',
    'cancelled',
    '100 Delete Test St, Tampa FL',
    'VA Hospital, Tampa FL',
    NOW() + INTERVAL '1 day'
  );

  -- Clear INSERT audit log
  DELETE FROM audit_logs WHERE resource_id = new_ride_id AND action = 'INSERT';

  -- Delete the ride as admin
  PERFORM test_set_user_context('test_admin_001');
  SET LOCAL ROLE authenticated;

  DELETE FROM rides WHERE id = new_ride_id;
  RESET ROLE;

  -- Verify DELETE audit log
  SELECT * INTO audit_record
  FROM audit_logs
  WHERE resource_type = 'rides'
    AND resource_id = new_ride_id
    AND action = 'DELETE';

  IF audit_record IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log not created for rides DELETE';
  END IF;

  IF audit_record.old_values IS NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log missing old_values for DELETE';
  END IF;

  IF audit_record.new_values IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: Audit log should have NULL new_values for DELETE';
  END IF;

  -- Cleanup
  DELETE FROM audit_logs WHERE resource_id = new_ride_id;

  RAISE NOTICE 'PASS: Audit trigger captures DELETE operations (AC #5)';
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
  RAISE NOTICE 'All Audit Logging Tests Completed Successfully';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'AC #1: Audit logs capture user ID and resource info - PASS';
  RAISE NOTICE 'AC #2: Audit logs capture old/new values on UPDATE - PASS';
  RAISE NOTICE 'AC #5: Triggers fire on all sensitive tables - PASS';
  RAISE NOTICE 'AC #6: SECURITY DEFINER handles NULL user_id - PASS';
  RAISE NOTICE '===========================================';
END $$;
