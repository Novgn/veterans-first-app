-- =============================================================================
-- Audit Logging Triggers
-- Story 1.5: Implement Audit Logging Infrastructure
-- =============================================================================
-- This migration creates:
-- 1. log_audit_event() trigger function with SECURITY DEFINER
-- 2. Triggers on rides, users, and family_links tables
--
-- Requirements:
-- - FR54: Log all access to rider personal and medical information
-- - FR55: Maintain audit trail of all ride modifications
--
-- SECURITY NOTES:
-- - SECURITY DEFINER allows trigger to bypass RLS for audit logging
-- - Function runs with owner privileges to INSERT into audit_logs
-- - User ID is extracted from Clerk JWT (auth.jwt()->>'sub')
-- =============================================================================

-- =============================================================================
-- AUDIT TRIGGER FUNCTION (AC: #1, #2, #6)
-- =============================================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_clerk_id TEXT;
BEGIN
  -- Get current Clerk user ID from JWT (may be NULL for service role operations)
  current_clerk_id := auth.jwt()->>'sub';

  -- Look up the database UUID from clerk_id (handles NULL gracefully)
  IF current_clerk_id IS NOT NULL AND current_clerk_id != '' THEN
    SELECT id INTO current_user_id
    FROM users
    WHERE clerk_id = current_clerk_id;
  ELSE
    current_user_id := NULL;
  END IF;

  -- Insert audit log entry
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  )
  VALUES (
    current_user_id,
    TG_OP,  -- 'INSERT', 'UPDATE', or 'DELETE'
    TG_TABLE_NAME,  -- Table name (rides, users, family_links)
    COALESCE(NEW.id, OLD.id),  -- Resource ID (NEW for INSERT, OLD for DELETE)
    CASE
      WHEN TG_OP IN ('DELETE', 'UPDATE') THEN row_to_json(OLD)::jsonb
      ELSE NULL
    END,
    CASE
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb
      ELSE NULL
    END
  );

  -- Return the appropriate row based on operation
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION log_audit_event() IS
  'Audit logging trigger function. SECURITY DEFINER bypasses RLS to allow
   audit log insertion. Captures user_id from Clerk JWT, operation type,
   table name, and before/after values for HIPAA compliance.';

-- =============================================================================
-- TRIGGERS FOR SENSITIVE TABLES (AC: #5)
-- =============================================================================

-- Trigger for rides table
CREATE TRIGGER audit_rides_trigger
  AFTER INSERT OR UPDATE OR DELETE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

COMMENT ON TRIGGER audit_rides_trigger ON rides IS
  'Audit logging trigger for HIPAA compliance - logs all ride modifications';

-- Trigger for users table
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

COMMENT ON TRIGGER audit_users_trigger ON users IS
  'Audit logging trigger for HIPAA compliance - logs all user data changes';

-- Trigger for family_links table
CREATE TRIGGER audit_family_links_trigger
  AFTER INSERT OR UPDATE OR DELETE ON family_links
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

COMMENT ON TRIGGER audit_family_links_trigger ON family_links IS
  'Audit logging trigger for HIPAA compliance - logs all family link changes';

-- =============================================================================
-- VERIFICATION QUERIES (run after migration to verify)
-- =============================================================================
-- SELECT tgname, tgrelid::regclass
-- FROM pg_trigger
-- WHERE tgname LIKE 'audit%';
--
-- Expected output:
-- audit_rides_trigger       | rides
-- audit_users_trigger       | users
-- audit_family_links_trigger | family_links
