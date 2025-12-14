-- Story 2.13: Rider Accessibility Preferences (FR72)
-- Adds accessibility preference fields to existing rider_preferences table

-- Add accessibility preference columns to existing rider_preferences table
ALTER TABLE rider_preferences
ADD COLUMN IF NOT EXISTS mobility_aid TEXT,
ADD COLUMN IF NOT EXISTS needs_door_assistance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_package_assistance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS extra_vehicle_space BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS special_equipment_notes TEXT;

-- Add constraint for mobility_aid values
ALTER TABLE rider_preferences
ADD CONSTRAINT mobility_aid_check
CHECK (mobility_aid IS NULL OR mobility_aid IN (
  'none',
  'cane',
  'walker',
  'manual_wheelchair',
  'power_wheelchair'
));

-- Add audit trigger for accessibility preference changes (HIPAA compliance - medical info)
CREATE OR REPLACE FUNCTION audit_accessibility_preference_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.mobility_aid IS DISTINCT FROM NEW.mobility_aid) OR
     (OLD.needs_door_assistance IS DISTINCT FROM NEW.needs_door_assistance) OR
     (OLD.needs_package_assistance IS DISTINCT FROM NEW.needs_package_assistance) OR
     (OLD.extra_vehicle_space IS DISTINCT FROM NEW.extra_vehicle_space) OR
     (OLD.special_equipment_notes IS DISTINCT FROM NEW.special_equipment_notes) THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
      NEW.user_id,
      'UPDATE',
      'accessibility_preferences',
      NEW.id,
      jsonb_build_object(
        'mobility_aid', OLD.mobility_aid,
        'needs_door_assistance', OLD.needs_door_assistance,
        'needs_package_assistance', OLD.needs_package_assistance,
        'extra_vehicle_space', OLD.extra_vehicle_space,
        'special_equipment_notes', OLD.special_equipment_notes
      ),
      jsonb_build_object(
        'mobility_aid', NEW.mobility_aid,
        'needs_door_assistance', NEW.needs_door_assistance,
        'needs_package_assistance', NEW.needs_package_assistance,
        'extra_vehicle_space', NEW.extra_vehicle_space,
        'special_equipment_notes', NEW.special_equipment_notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_accessibility_preferences_update
  AFTER UPDATE ON rider_preferences
  FOR EACH ROW
  EXECUTE FUNCTION audit_accessibility_preference_changes();

-- Also audit INSERT operations for first-time accessibility preference saves
CREATE OR REPLACE FUNCTION audit_accessibility_preference_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only audit if accessibility fields are being set (not just preferred driver)
  IF NEW.mobility_aid IS NOT NULL OR
     NEW.needs_door_assistance = true OR
     NEW.needs_package_assistance = true OR
     NEW.extra_vehicle_space = true OR
     NEW.special_equipment_notes IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
      NEW.user_id,
      'INSERT',
      'accessibility_preferences',
      NEW.id,
      NULL,
      jsonb_build_object(
        'mobility_aid', NEW.mobility_aid,
        'needs_door_assistance', NEW.needs_door_assistance,
        'needs_package_assistance', NEW.needs_package_assistance,
        'extra_vehicle_space', NEW.extra_vehicle_space,
        'special_equipment_notes', NEW.special_equipment_notes
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_accessibility_preferences_insert
  AFTER INSERT ON rider_preferences
  FOR EACH ROW
  EXECUTE FUNCTION audit_accessibility_preference_insert();

COMMENT ON COLUMN rider_preferences.mobility_aid IS 'Mobility aid type: none, cane, walker, manual_wheelchair, power_wheelchair - FR72';
COMMENT ON COLUMN rider_preferences.needs_door_assistance IS 'Rider needs help getting to/from door - FR72';
COMMENT ON COLUMN rider_preferences.needs_package_assistance IS 'Rider needs help with packages/belongings - FR72';
COMMENT ON COLUMN rider_preferences.extra_vehicle_space IS 'Rider requires extra vehicle space for equipment - FR72';
COMMENT ON COLUMN rider_preferences.special_equipment_notes IS 'Additional notes about special equipment or needs - FR72';
