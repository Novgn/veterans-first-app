-- =============================================================================
-- Veterans First Seed Data
-- Story 1.4: Implement Role-Based Access Control (RBAC)
-- =============================================================================
-- This file contains test data for RLS policy verification
-- Each role has at least one test user to verify access controls
-- =============================================================================

-- =============================================================================
-- TEST USERS (one for each role)
-- Note: clerk_id values are test identifiers that match auth.jwt()->>'sub'
-- In production, these would be actual Clerk user IDs like "user_2abc123..."
-- =============================================================================

INSERT INTO users (id, clerk_id, phone, email, first_name, last_name, role) VALUES
  -- Admin user
  ('00000000-0000-0000-0000-000000000001', 'test_admin_001', '+15550000001', 'admin@test.com', 'Admin', 'User', 'admin'),

  -- Dispatcher user
  ('00000000-0000-0000-0000-000000000002', 'test_dispatcher_001', '+15550000002', 'dispatcher@test.com', 'Dispatch', 'Manager', 'dispatcher'),

  -- Rider users
  ('00000000-0000-0000-0000-000000000010', 'test_rider_001', '+15550000010', 'rider1@test.com', 'John', 'Veteran', 'rider'),
  ('00000000-0000-0000-0000-000000000011', 'test_rider_002', '+15550000011', 'rider2@test.com', 'Jane', 'Servicemember', 'rider'),

  -- Driver users
  ('00000000-0000-0000-0000-000000000020', 'test_driver_001', '+15550000020', 'driver1@test.com', 'Mike', 'Driver', 'driver'),
  ('00000000-0000-0000-0000-000000000021', 'test_driver_002', '+15550000021', 'driver2@test.com', 'Sarah', 'Transporter', 'driver'),

  -- Family member users
  ('00000000-0000-0000-0000-000000000030', 'test_family_001', '+15550000030', 'family1@test.com', 'Bob', 'FamilyMember', 'family'),
  ('00000000-0000-0000-0000-000000000031', 'test_family_002', '+15550000031', 'family2@test.com', 'Alice', 'Caregiver', 'family');

-- =============================================================================
-- FAMILY LINKS (for AC #3 - family role access testing)
-- =============================================================================

INSERT INTO family_links (id, rider_id, family_member_id, status) VALUES
  -- Bob (family_001) is linked to John (rider_001) - approved
  ('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000030', 'approved'),

  -- Alice (family_002) has pending link to Jane (rider_002)
  ('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000031', 'pending'),

  -- Bob (family_001) also has access to Jane (rider_002) - approved
  ('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000030', 'approved');

-- =============================================================================
-- TEST RIDES (for RBAC policy verification)
-- =============================================================================

INSERT INTO rides (id, rider_id, driver_id, status, pickup_address, dropoff_address, scheduled_pickup_time) VALUES
  -- John's rides (rider_001)
  -- Ride 1: Pending (no driver assigned yet)
  ('00000000-0000-0000-0000-200000000001', '00000000-0000-0000-0000-000000000010', NULL, 'pending',
   '123 Main St, Tampa FL', 'VA Hospital, Tampa FL', NOW() + INTERVAL '1 day'),

  -- Ride 2: Assigned to Mike (driver_001)
  ('00000000-0000-0000-0000-200000000002', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'assigned',
   '456 Oak Ave, Tampa FL', 'VA Clinic, Tampa FL', NOW() + INTERVAL '2 days'),

  -- Ride 3: In progress with Mike (driver_001)
  ('00000000-0000-0000-0000-200000000003', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'in_progress',
   '789 Pine Rd, Tampa FL', 'VA Hospital, Tampa FL', NOW()),

  -- Ride 4: Completed
  ('00000000-0000-0000-0000-200000000004', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 'completed',
   '321 Elm St, Tampa FL', 'VA Hospital, Tampa FL', NOW() - INTERVAL '1 day'),

  -- Jane's rides (rider_002)
  -- Ride 5: Assigned to Sarah (driver_002)
  ('00000000-0000-0000-0000-200000000005', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021', 'assigned',
   '555 Beach Blvd, Tampa FL', 'VA Clinic, Tampa FL', NOW() + INTERVAL '3 days'),

  -- Ride 6: In progress with Sarah (driver_002)
  ('00000000-0000-0000-0000-200000000006', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021', 'in_progress',
   '666 Harbor Dr, Tampa FL', 'VA Hospital, Tampa FL', NOW()),

  -- Ride 7: Cancelled
  ('00000000-0000-0000-0000-200000000007', '00000000-0000-0000-0000-000000000011', NULL, 'cancelled',
   '777 Bay St, Tampa FL', 'VA Clinic, Tampa FL', NOW() + INTERVAL '1 day');

-- =============================================================================
-- TEST AUDIT LOGS (for AC #8 - append-only verification)
-- =============================================================================

INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, old_values, new_values) VALUES
  ('00000000-0000-0000-0000-300000000001', '00000000-0000-0000-0000-000000000001', 'create', 'user', '00000000-0000-0000-0000-000000000010', NULL, '{"role": "rider"}'::jsonb),
  ('00000000-0000-0000-0000-300000000002', '00000000-0000-0000-0000-000000000002', 'create', 'ride', '00000000-0000-0000-0000-200000000001', NULL, '{"status": "pending"}'::jsonb),
  ('00000000-0000-0000-0000-300000000003', '00000000-0000-0000-0000-000000000002', 'update', 'ride', '00000000-0000-0000-0000-200000000002', '{"status": "pending"}'::jsonb, '{"status": "assigned"}'::jsonb);

-- =============================================================================
-- VERIFICATION QUERIES (run these to verify seed data)
-- =============================================================================
-- SELECT * FROM users;
-- SELECT * FROM family_links;
-- SELECT * FROM rides;
-- SELECT * FROM audit_logs;
--
-- Expected RLS behavior summary:
-- - Admin (test_admin_001): Can see ALL data in all tables
-- - Dispatcher (test_dispatcher_001): Can see all users and rides
-- - Rider John (test_rider_001): Can see own profile and own rides (4 rides)
-- - Rider Jane (test_rider_002): Can see own profile and own rides (3 rides)
-- - Driver Mike (test_driver_001): Can see own profile, assigned/in_progress rides (2 rides: #2, #3)
-- - Driver Sarah (test_driver_002): Can see own profile, assigned/in_progress rides (2 rides: #5, #6)
-- - Family Bob (test_family_001): Can see linked riders' rides (John's 4 + Jane's 3 = 7 rides)
-- - Family Alice (test_family_002): No approved links, sees no rides
