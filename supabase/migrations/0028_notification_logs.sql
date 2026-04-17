-- Migration: 0028_notification_logs
-- Story 4.6: Append-only log of every notification dispatch attempt. Used by
--            the reminder endpoint for dedupe and by support for auditing.

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_channel_check CHECK (channel IN ('push', 'sms', 'email')),
  CONSTRAINT notification_status_check CHECK (status IN ('sent', 'delivered', 'failed', 'skipped'))
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user_created
  ON notification_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_ride
  ON notification_logs(ride_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type_ride
  ON notification_logs(notification_type, ride_id);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users see their own logs. No insert/update/delete for end users — writes
-- come from the service-role key used by the notifications endpoints.
DROP POLICY IF EXISTS "Users view own notification logs" ON notification_logs;
CREATE POLICY "Users view own notification logs" ON notification_logs
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

DROP POLICY IF EXISTS "Admins view all notification logs" ON notification_logs;
CREATE POLICY "Admins view all notification logs" ON notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
        AND role IN ('admin', 'dispatcher')
    )
  );
