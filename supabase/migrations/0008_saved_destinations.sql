-- =============================================================================
-- Saved Destinations Table
-- Story 2.2: Implement Saved Destinations Management
-- =============================================================================
-- This migration creates:
-- 1. saved_destinations table for storing rider's frequently used locations
-- 2. RLS policies ensuring riders can only manage their own destinations
-- 3. Audit logging trigger for HIPAA compliance
--
-- Requirements:
-- - FR3: Riders can save frequently used destinations with custom labels
-- - AC#4: Database schema includes saved_destinations table with RLS policies
--
-- SECURITY NOTES:
-- - RLS policies use Clerk JWT to identify users
-- - Riders can only SELECT/INSERT/UPDATE/DELETE their own destinations
-- - Audit logging captures all CRUD operations
-- =============================================================================

-- =============================================================================
-- SAVED DESTINATIONS TABLE (AC: #4)
-- =============================================================================

CREATE TABLE saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  place_id TEXT, -- Google Places ID for consistent resolution
  is_default_pickup BOOLEAN DEFAULT false,
  is_default_dropoff BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment explaining the table
COMMENT ON TABLE saved_destinations IS
  'Stores rider saved destinations with custom labels for quick booking.
   FR3: Riders can save frequently used destinations with custom labels.';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_saved_destinations_user_id ON saved_destinations(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES (AC: #4)
-- =============================================================================

ALTER TABLE saved_destinations ENABLE ROW LEVEL SECURITY;

-- SELECT: Riders can view only their own destinations
CREATE POLICY "select_own_destinations" ON saved_destinations
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- INSERT: Riders can add destinations only for themselves
CREATE POLICY "insert_own_destinations" ON saved_destinations
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- UPDATE: Riders can update only their own destinations
CREATE POLICY "update_own_destinations" ON saved_destinations
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- DELETE: Riders can delete only their own destinations
CREATE POLICY "delete_own_destinations" ON saved_destinations
  FOR DELETE USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- =============================================================================
-- AUDIT LOGGING TRIGGER (HIPAA Compliance)
-- =============================================================================
-- Uses existing log_audit_event() function from 0006_audit_logging_triggers.sql

CREATE TRIGGER audit_saved_destinations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON saved_destinations
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

COMMENT ON TRIGGER audit_saved_destinations_trigger ON saved_destinations IS
  'Audit logging trigger for HIPAA compliance - logs all saved destination changes';

-- =============================================================================
-- VERIFICATION QUERIES (run after migration to verify)
-- =============================================================================
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'saved_destinations';
-- SELECT policyname FROM pg_policies WHERE tablename = 'saved_destinations';
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'saved_destinations'::regclass;
