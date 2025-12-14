-- Story 2.14: Rider Comfort Preferences (FR73)
-- Adds comfort preference fields to existing rider_preferences table

-- Add comfort preference columns to existing rider_preferences table
ALTER TABLE rider_preferences
ADD COLUMN IF NOT EXISTS comfort_temperature TEXT,
ADD COLUMN IF NOT EXISTS conversation_preference TEXT,
ADD COLUMN IF NOT EXISTS music_preference TEXT,
ADD COLUMN IF NOT EXISTS other_notes TEXT;

-- Add constraint for comfort_temperature values
ALTER TABLE rider_preferences
ADD CONSTRAINT comfort_temperature_check
CHECK (comfort_temperature IS NULL OR comfort_temperature IN (
  'cool',
  'normal',
  'warm'
));

-- Add constraint for conversation_preference values
ALTER TABLE rider_preferences
ADD CONSTRAINT conversation_preference_check
CHECK (conversation_preference IS NULL OR conversation_preference IN (
  'quiet',
  'some',
  'chatty'
));

-- Add constraint for music_preference values
ALTER TABLE rider_preferences
ADD CONSTRAINT music_preference_check
CHECK (music_preference IS NULL OR music_preference IN (
  'none',
  'soft',
  'any'
));

-- Add audit trigger for comfort preference changes
CREATE OR REPLACE FUNCTION audit_comfort_preference_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.comfort_temperature IS DISTINCT FROM NEW.comfort_temperature) OR
     (OLD.conversation_preference IS DISTINCT FROM NEW.conversation_preference) OR
     (OLD.music_preference IS DISTINCT FROM NEW.music_preference) OR
     (OLD.other_notes IS DISTINCT FROM NEW.other_notes) THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
      NEW.user_id,
      'UPDATE',
      'comfort_preferences',
      NEW.id,
      jsonb_build_object(
        'comfort_temperature', OLD.comfort_temperature,
        'conversation_preference', OLD.conversation_preference,
        'music_preference', OLD.music_preference,
        'other_notes', OLD.other_notes
      ),
      jsonb_build_object(
        'comfort_temperature', NEW.comfort_temperature,
        'conversation_preference', NEW.conversation_preference,
        'music_preference', NEW.music_preference,
        'other_notes', NEW.other_notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS trigger_audit_comfort_preferences_update ON rider_preferences;

CREATE TRIGGER trigger_audit_comfort_preferences_update
  AFTER UPDATE ON rider_preferences
  FOR EACH ROW
  EXECUTE FUNCTION audit_comfort_preference_changes();

-- Column comments for documentation
COMMENT ON COLUMN rider_preferences.comfort_temperature IS 'Temperature preference: cool, normal, warm - FR73';
COMMENT ON COLUMN rider_preferences.conversation_preference IS 'Conversation level: quiet, some, chatty - FR73';
COMMENT ON COLUMN rider_preferences.music_preference IS 'Music preference: none, soft, any - FR73';
COMMENT ON COLUMN rider_preferences.other_notes IS 'Additional rider comfort notes - FR73';
