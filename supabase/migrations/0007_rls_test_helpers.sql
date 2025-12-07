-- =============================================================================
-- RLS Test Helper Functions
-- Created by: Code Review (Story 1.5)
-- =============================================================================
-- These functions enable TypeScript tests to simulate user context and test RLS
-- policies. They are SECURITY DEFINER to allow switching roles for testing.
--
-- Functions created:
-- 1. test_count_as_user(p_clerk_id, p_table_name) - Count visible rows
-- 2. test_query_as_user(p_clerk_id, p_table_name, p_columns) - Query as user
-- 3. create_rls_test_helpers() - No-op for backwards compatibility
-- 4. drop_rls_test_helpers() - No-op for backwards compatibility
-- =============================================================================

-- =============================================================================
-- FUNCTION: test_count_as_user
-- Counts rows visible to a specific user in a given table
-- NOTE: NOT using SECURITY DEFINER to allow SET LOCAL ROLE
-- =============================================================================
CREATE OR REPLACE FUNCTION test_count_as_user(
  p_clerk_id TEXT,
  p_table_name TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  row_count INTEGER;
BEGIN
  -- Set the JWT context to simulate the user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);

  -- Switch to authenticated role for RLS
  SET LOCAL ROLE authenticated;

  -- Execute count query with RLS applied
  EXECUTE format('SELECT COUNT(*)::INTEGER FROM %I', p_table_name) INTO row_count;

  RETURN row_count;
EXCEPTION
  WHEN OTHERS THEN
    -- Return -1 on error to distinguish from 0 count
    RETURN -1;
END;
$$;

COMMENT ON FUNCTION test_count_as_user(TEXT, TEXT) IS
  'Test helper: Counts visible rows in a table for a simulated user (by clerk_id).
   Returns -1 on error. Uses SECURITY INVOKER to allow role switching.';

-- =============================================================================
-- FUNCTION: test_query_as_user
-- Queries a table as a specific user, returning results as JSONB
-- NOTE: NOT using SECURITY DEFINER to allow SET LOCAL ROLE
-- =============================================================================
CREATE OR REPLACE FUNCTION test_query_as_user(
  p_clerk_id TEXT,
  p_table_name TEXT,
  p_columns TEXT DEFAULT '*'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Set the JWT context to simulate the user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_clerk_id)::text, true);

  -- Switch to authenticated role for RLS
  SET LOCAL ROLE authenticated;

  -- Execute query with RLS applied
  EXECUTE format('
    SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb)
    FROM (SELECT %s FROM %I) t
  ', p_columns, p_table_name) INTO result;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION test_query_as_user(TEXT, TEXT, TEXT) IS
  'Test helper: Queries a table as a simulated user (by clerk_id).
   Returns results as JSONB array, or NULL on error. Uses SECURITY INVOKER.';

-- =============================================================================
-- FUNCTION: create_rls_test_helpers (backwards compatibility)
-- No-op since helpers are now created via migration
-- =============================================================================
CREATE OR REPLACE FUNCTION create_rls_test_helpers()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- No-op: Test helpers are now created via migration
  -- This function exists for backwards compatibility with existing tests
  NULL;
END;
$$;

COMMENT ON FUNCTION create_rls_test_helpers() IS
  'No-op for backwards compatibility. RLS test helpers are created via migration.';

-- =============================================================================
-- FUNCTION: drop_rls_test_helpers (backwards compatibility)
-- No-op since helpers should persist
-- =============================================================================
CREATE OR REPLACE FUNCTION drop_rls_test_helpers()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- No-op: Test helpers should persist across test runs
  -- This function exists for backwards compatibility with existing tests
  NULL;
END;
$$;

COMMENT ON FUNCTION drop_rls_test_helpers() IS
  'No-op for backwards compatibility. RLS test helpers persist across test runs.';

-- =============================================================================
-- GRANT permissions for authenticated role to call test helpers
-- =============================================================================
GRANT EXECUTE ON FUNCTION test_count_as_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION test_query_as_user(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_rls_test_helpers() TO authenticated;
GRANT EXECUTE ON FUNCTION drop_rls_test_helpers() TO authenticated;

-- Also grant to service_role for direct testing
GRANT EXECUTE ON FUNCTION test_count_as_user(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION test_query_as_user(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION create_rls_test_helpers() TO service_role;
GRANT EXECUTE ON FUNCTION drop_rls_test_helpers() TO service_role;
