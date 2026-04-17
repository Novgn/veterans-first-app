-- Migration: 0024_family_links_enhancements
-- Story 4.1: Extend family_links with relationship + permissions + invited phone;
--            relax family_member_id NOT NULL (so pending invites can reference
--            a phone number before the invitee signs up); add RLS policies.

ALTER TABLE family_links
  ADD COLUMN IF NOT EXISTS relationship TEXT,
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT
    '{"view_rides": true, "book_rides": false, "receive_notifications": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS invited_phone TEXT;

-- Allow pending links to omit family_member_id until the invitee signs up.
ALTER TABLE family_links ALTER COLUMN family_member_id DROP NOT NULL;

-- Either family_member_id or invited_phone must be present on every row.
ALTER TABLE family_links DROP CONSTRAINT IF EXISTS family_links_target_present;
ALTER TABLE family_links
  ADD CONSTRAINT family_links_target_present
  CHECK (family_member_id IS NOT NULL OR invited_phone IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_family_links_rider_id ON family_links(rider_id);
CREATE INDEX IF NOT EXISTS idx_family_links_family_member_id ON family_links(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_links_invited_phone ON family_links(invited_phone);
CREATE INDEX IF NOT EXISTS idx_family_links_status ON family_links(status);

ALTER TABLE family_links ENABLE ROW LEVEL SECURITY;

-- Riders manage their own links (full CRUD).
DROP POLICY IF EXISTS "Riders view own family links" ON family_links;
CREATE POLICY "Riders view own family links" ON family_links
  FOR SELECT USING (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Riders insert own family links" ON family_links;
CREATE POLICY "Riders insert own family links" ON family_links
  FOR INSERT WITH CHECK (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Riders update own family links" ON family_links;
CREATE POLICY "Riders update own family links" ON family_links
  FOR UPDATE USING (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Riders delete own family links" ON family_links;
CREATE POLICY "Riders delete own family links" ON family_links
  FOR DELETE USING (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- Family members see + respond to links pointing at them. Approve flips the
-- status; decline deletes the row so the rider can re-invite if needed.
DROP POLICY IF EXISTS "Family members view own family links" ON family_links;
CREATE POLICY "Family members view own family links" ON family_links
  FOR SELECT USING (
    family_member_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Family members respond to own family links" ON family_links;
CREATE POLICY "Family members respond to own family links" ON family_links
  FOR UPDATE USING (
    family_member_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Family members decline own family links" ON family_links;
CREATE POLICY "Family members decline own family links" ON family_links
  FOR DELETE USING (
    family_member_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
      AND status = 'pending'
  );

-- Dispatchers/admins: read-only access for support.
DROP POLICY IF EXISTS "Dispatchers view all family links" ON family_links;
CREATE POLICY "Dispatchers view all family links" ON family_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
        AND role IN ('dispatcher', 'admin')
    )
  );
