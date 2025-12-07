-- =============================================================================
-- RLS Helper Functions for Role-Based Access Control
-- Story 1.4: Implement Role-Based Access Control (RBAC)
-- =============================================================================

-- IMPORTANT: With Clerk as third-party auth provider, we use auth.jwt()->>'sub'
-- to get the Clerk user ID (string), NOT auth.uid() which returns a UUID.
-- See: https://clerk.com/blog/how-clerk-integrates-with-supabase-auth

-- Function to get the current user's role
-- Uses clerk_id to match the 'sub' claim from the Clerk JWT
-- SECURITY DEFINER allows the function to bypass RLS to look up the role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE clerk_id = (auth.jwt()->>'sub')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if the current user is a family member linked to a rider
-- Returns true if there's an approved family link between the current user and the specified rider
CREATE OR REPLACE FUNCTION is_family_linked(rider_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_links fl
    JOIN users u ON fl.family_member_id = u.id
    WHERE fl.rider_id = rider_uuid
      AND u.clerk_id = (auth.jwt()->>'sub')
      AND fl.status = 'approved'
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to get the current user's database UUID from their clerk_id
-- Useful for comparing against foreign key references (rides.rider_id, etc.)
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
