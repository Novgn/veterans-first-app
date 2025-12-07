-- =============================================================================
-- Row Level Security Policies for Veterans First App
-- Story 1.4: Implement Role-Based Access Control (RBAC)
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES (AC: #7)
-- Users can see their own profile; dispatchers/admins see all
-- NOTE: With Clerk as third-party auth, use auth.jwt()->>'sub' for clerk_id comparison
-- =============================================================================

-- SELECT: Users see own profile, dispatchers/admins see all
CREATE POLICY "users_select_policy" ON users
  FOR SELECT TO authenticated
  USING (
    clerk_id = (auth.jwt()->>'sub')
    OR get_user_role() IN ('dispatcher', 'admin')
  );

-- UPDATE: Users update own profile, admins update any
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE TO authenticated
  USING (
    clerk_id = (auth.jwt()->>'sub')
    OR get_user_role() = 'admin'
  )
  WITH CHECK (
    clerk_id = (auth.jwt()->>'sub')
    OR get_user_role() = 'admin'
  );

-- INSERT: Only service role can insert (via webhook)
-- No policy needed for authenticated users - webhook uses service role

-- DELETE: Only admin can soft-delete (via deletedAt update, covered by update policy)
-- Hard delete not permitted

-- =============================================================================
-- RIDES TABLE POLICIES (AC: #1-5)
-- Role-based access: rider=own, driver=assigned, family=linked, dispatch/admin=all
-- =============================================================================

-- SELECT: Role-based read access
CREATE POLICY "rides_select_policy" ON rides
  FOR SELECT TO authenticated
  USING (
    -- Rider sees own rides (AC #1)
    (get_user_role() = 'rider' AND rider_id = get_current_user_id())
    OR
    -- Driver sees assigned rides with status 'assigned' or 'in_progress' (AC #2)
    (get_user_role() = 'driver' AND driver_id = get_current_user_id() AND status IN ('assigned', 'in_progress'))
    OR
    -- Family sees linked rider rides (AC #3)
    (get_user_role() = 'family' AND is_family_linked(rider_id))
    OR
    -- Dispatcher sees all rides (AC #4)
    get_user_role() = 'dispatcher'
    OR
    -- Admin has full access (AC #5)
    get_user_role() = 'admin'
  );

-- INSERT: Riders can create their own rides, dispatchers/admin can create any
CREATE POLICY "rides_insert_policy" ON rides
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Rider can create their own ride
    (get_user_role() = 'rider' AND rider_id = get_current_user_id())
    OR
    -- Dispatcher/Admin can create any ride
    get_user_role() IN ('dispatcher', 'admin')
  );

-- UPDATE: Role-based update access
CREATE POLICY "rides_update_policy" ON rides
  FOR UPDATE TO authenticated
  USING (
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
    (get_user_role() = 'driver' AND driver_id = get_current_user_id())
    OR
    get_user_role() IN ('dispatcher', 'admin')
  );

-- DELETE: Only admin can delete rides
CREATE POLICY "rides_delete_policy" ON rides
  FOR DELETE TO authenticated
  USING (get_user_role() = 'admin');

-- =============================================================================
-- FAMILY_LINKS TABLE POLICIES (AC: #3)
-- Family members see their own links, riders see who has access
-- =============================================================================

-- SELECT: Family members see their links, riders see who has access to them
CREATE POLICY "family_links_select_policy" ON family_links
  FOR SELECT TO authenticated
  USING (
    -- Family member sees their own links
    family_member_id = get_current_user_id()
    OR
    -- Rider sees who has access to their data
    rider_id = get_current_user_id()
    OR
    -- Admin sees all
    get_user_role() = 'admin'
  );

-- INSERT: Riders can create family links (invite family), admin can create any
CREATE POLICY "family_links_insert_policy" ON family_links
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Rider can invite family members
    rider_id = get_current_user_id()
    OR
    -- Admin can create any link
    get_user_role() = 'admin'
  );

-- UPDATE: Riders can update their own links (approve/revoke), admin can update any
CREATE POLICY "family_links_update_policy" ON family_links
  FOR UPDATE TO authenticated
  USING (
    -- Rider can manage links to their data
    rider_id = get_current_user_id()
    OR
    -- Admin can update any link
    get_user_role() = 'admin'
  )
  WITH CHECK (
    rider_id = get_current_user_id()
    OR
    get_user_role() = 'admin'
  );

-- DELETE: Riders can delete their own links, admin can delete any
CREATE POLICY "family_links_delete_policy" ON family_links
  FOR DELETE TO authenticated
  USING (
    rider_id = get_current_user_id()
    OR
    get_user_role() = 'admin'
  );

-- =============================================================================
-- AUDIT_LOGS TABLE POLICIES (AC: #8)
-- Append-only: all authenticated users can INSERT, only admin can SELECT
-- No UPDATE or DELETE allowed (append-only for compliance)
-- =============================================================================

-- INSERT: All authenticated users can append audit logs
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- SELECT: Only admin can read audit logs
CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT TO authenticated
  USING (get_user_role() = 'admin');

-- UPDATE: No one can update audit logs (append-only)
-- No policy = denied by default with RLS enabled

-- DELETE: No one can delete audit logs (append-only)
-- No policy = denied by default with RLS enabled
