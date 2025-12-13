/**
 * EmergencyContactForm Component
 *
 * Form for editing emergency contact information.
 * Story 2.12: Implement Rider Profile Management (AC: #2, #4)
 *
 * Features:
 * - Name, phone, and relationship fields
 * - Relationship selection via pill buttons
 * - Form validation
 * - Accessibility support
 */

import { View, Text, TextInput, Pressable } from 'react-native';

/** Relationship options for emergency contact */
export const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'other', label: 'Other' },
] as const;

export type RelationshipType = (typeof RELATIONSHIP_OPTIONS)[number]['value'];

export interface EmergencyContactFormValues {
  name: string;
  phone: string;
  relationship: RelationshipType | null;
}

interface EmergencyContactFormProps {
  /** Current form values */
  values: EmergencyContactFormValues;
  /** Callback when form values change */
  onChange: (values: EmergencyContactFormValues) => void;
  /** Form validation errors */
  errors?: {
    name?: string;
    phone?: string;
  };
  /** Optional test ID */
  testID?: string;
}

/**
 * Emergency contact form component with name, phone, and relationship fields.
 * Uses controlled inputs with onChange callback.
 */
export function EmergencyContactForm({
  values,
  onChange,
  errors,
  testID,
}: EmergencyContactFormProps) {
  const handleNameChange = (text: string) => {
    onChange({ ...values, name: text });
  };

  const handlePhoneChange = (text: string) => {
    onChange({ ...values, phone: text });
  };

  const handleRelationshipChange = (relationship: RelationshipType) => {
    onChange({ ...values, relationship });
  };

  return (
    <View testID={testID}>
      {/* Section Header */}
      <Text className="mb-1 text-lg font-semibold text-foreground">Emergency Contact</Text>
      <Text className="mb-4 text-sm text-gray-600">
        This person will be contacted in case of an emergency during your ride.
      </Text>

      {/* Name Field */}
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-gray-700">Contact Name</Text>
        <TextInput
          className={`min-h-[48px] rounded-lg border px-4 text-base ${
            errors?.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Full name"
          value={values.name}
          onChangeText={handleNameChange}
          accessibilityLabel="Emergency contact name"
          accessibilityHint="Enter the full name of your emergency contact"
          testID={testID ? `${testID}-name-input` : undefined}
        />
        {errors?.name && (
          <Text className="mt-1 text-sm text-red-500" accessibilityRole="alert">
            {errors.name}
          </Text>
        )}
      </View>

      {/* Phone Field */}
      <View className="mb-4">
        <Text className="mb-1 text-sm font-medium text-gray-700">Contact Phone</Text>
        <TextInput
          className={`min-h-[48px] rounded-lg border px-4 text-base ${
            errors?.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="(555) 555-5555"
          value={values.phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          accessibilityLabel="Emergency contact phone number"
          accessibilityHint="Enter your emergency contact's phone number"
          testID={testID ? `${testID}-phone-input` : undefined}
        />
        {errors?.phone && (
          <Text className="mt-1 text-sm text-red-500" accessibilityRole="alert">
            {errors.phone}
          </Text>
        )}
      </View>

      {/* Relationship Picker */}
      <View>
        <Text className="mb-2 text-sm font-medium text-gray-700">Relationship</Text>
        <View
          className="flex-row flex-wrap gap-2"
          accessibilityRole="radiogroup"
          accessibilityLabel="Select relationship to emergency contact">
          {RELATIONSHIP_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleRelationshipChange(option.value)}
              className={`min-h-[40px] rounded-full px-4 py-2 ${
                values.relationship === option.value ? 'bg-primary' : 'bg-gray-100'
              }`}
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: values.relationship === option.value }}
              testID={testID ? `${testID}-relationship-${option.value}` : undefined}>
              <Text
                className={`font-medium ${
                  values.relationship === option.value ? 'text-white' : 'text-gray-700'
                }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * Validates emergency contact form values.
 * Returns errors object if validation fails, or empty object if valid.
 */
export function validateEmergencyContact(values: EmergencyContactFormValues): {
  name?: string;
  phone?: string;
} {
  const errors: { name?: string; phone?: string } = {};

  // Name validation
  if (values.name && values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  // Phone validation (US phone number format)
  if (values.phone && !/^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/.test(values.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  return errors;
}
