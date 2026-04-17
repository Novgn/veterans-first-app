-- Migration: 0027_create_notification_preferences
-- Story 4.5: Per-user notification channel + type preferences. Used by
--            stories 4.6–4.10 + the ride-notifications endpoint to decide
--            whether to dispatch each notification.

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  driver_updates_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  arrival_photos_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  push_token TEXT, -- Story 4.8 populates this; Story 4.5 just reserves the column.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
  ON notification_preferences(user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notification prefs" ON notification_preferences;
CREATE POLICY "Users view own notification prefs" ON notification_preferences
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Users insert own notification prefs" ON notification_preferences;
CREATE POLICY "Users insert own notification prefs" ON notification_preferences
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Users update own notification prefs" ON notification_preferences;
CREATE POLICY "Users update own notification prefs" ON notification_preferences
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );
