-- Story 2.12: Rider Profile Management - Emergency Contact Support
-- FR71: Riders can update their profile information (name, phone, emergency contact)

-- Add emergency contact fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Add constraint for relationship values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'emergency_contact_relationship_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT emergency_contact_relationship_check
    CHECK (emergency_contact_relationship IS NULL OR emergency_contact_relationship IN (
      'spouse',
      'parent',
      'child',
      'sibling',
      'friend',
      'caregiver',
      'other'
    ));
  END IF;
END $$;

-- Add audit trigger for emergency contact changes (HIPAA compliance)
CREATE OR REPLACE FUNCTION audit_emergency_contact_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.emergency_contact_name IS DISTINCT FROM NEW.emergency_contact_name) OR
     (OLD.emergency_contact_phone IS DISTINCT FROM NEW.emergency_contact_phone) OR
     (OLD.emergency_contact_relationship IS DISTINCT FROM NEW.emergency_contact_relationship) THEN
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
      NEW.id,
      'UPDATE',
      'emergency_contact',
      NEW.id,
      jsonb_build_object(
        'name', OLD.emergency_contact_name,
        'phone', OLD.emergency_contact_phone,
        'relationship', OLD.emergency_contact_relationship
      ),
      jsonb_build_object(
        'name', NEW.emergency_contact_name,
        'phone', NEW.emergency_contact_phone,
        'relationship', NEW.emergency_contact_relationship
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists to ensure clean state)
DROP TRIGGER IF EXISTS trigger_audit_emergency_contact ON users;
CREATE TRIGGER trigger_audit_emergency_contact
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_emergency_contact_changes();

-- Add column comments for documentation
COMMENT ON COLUMN users.emergency_contact_name IS 'Emergency contact full name - FR71';
COMMENT ON COLUMN users.emergency_contact_phone IS 'Emergency contact phone number - FR71';
COMMENT ON COLUMN users.emergency_contact_relationship IS 'Relationship to rider - FR71';
