/**
 * EditProfileSheet Component
 *
 * Modal for editing rider profile including photo and emergency contact.
 * Story 2.12: Implement Rider Profile Management (AC: #2, #6)
 *
 * Features:
 * - Profile photo upload
 * - Emergency contact form
 * - Save with loading state
 * - Cancel to dismiss
 * - Accessibility support
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import {
  EmergencyContactForm,
  validateEmergencyContact,
  type EmergencyContactFormValues,
} from './EmergencyContactForm';

interface EditProfileSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Callback when sheet is closed */
  onClose: () => void;
  /** Callback when profile is saved */
  onSave: (data: EditProfileData) => Promise<void>;
  /** Current user profile data */
  initialData: {
    profilePhotoUrl: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactRelationship: string | null;
  };
  /** User ID for photo upload */
  userId: string;
  /** Optional test ID */
  testID?: string;
}

export interface EditProfileData {
  profilePhotoUrl?: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
}

/**
 * Modal sheet for editing profile photo and emergency contact.
 * Integrates ProfilePhotoUpload and EmergencyContactForm components.
 */
export function EditProfileSheet({
  visible,
  onClose,
  onSave,
  initialData,
  userId,
  testID,
}: EditProfileSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData.profilePhotoUrl);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContactFormValues>({
    name: initialData.emergencyContactName ?? '',
    phone: initialData.emergencyContactPhone ?? '',
    relationship:
      (initialData.emergencyContactRelationship as EmergencyContactFormValues['relationship']) ??
      null,
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  // Reset form when modal opens with new data
  useEffect(() => {
    if (visible) {
      setPhotoUrl(initialData.profilePhotoUrl);
      setEmergencyContact({
        name: initialData.emergencyContactName ?? '',
        phone: initialData.emergencyContactPhone ?? '',
        relationship:
          (initialData.emergencyContactRelationship as EmergencyContactFormValues['relationship']) ??
          null,
      });
      setErrors({});
    }
  }, [visible, initialData]);

  const handlePhotoUploaded = (url: string) => {
    setPhotoUrl(url);
  };

  const handleEmergencyContactChange = (values: EmergencyContactFormValues) => {
    setEmergencyContact(values);
    // Clear errors on change
    if (errors.name || errors.phone) {
      setErrors({});
    }
  };

  const handleSave = async () => {
    // Validate
    const validationErrors = validateEmergencyContact(emergencyContact);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        profilePhotoUrl: photoUrl ?? undefined,
        emergencyContactName: emergencyContact.name || null,
        emergencyContactPhone: emergencyContact.phone || null,
        emergencyContactRelationship: emergencyContact.relationship,
      });
      // Show success feedback (AC #4)
      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => onClose() },
      ]);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Show error feedback to user
      Alert.alert('Save Failed', 'Could not save your profile. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
      testID={testID}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
          <Pressable
            onPress={handleCancel}
            disabled={isSaving}
            className="min-h-[44px] min-w-[44px] items-start justify-center"
            accessibilityLabel="Cancel"
            accessibilityRole="button"
            testID={testID ? `${testID}-cancel-button` : undefined}>
            <Text className="text-lg text-primary">Cancel</Text>
          </Pressable>

          <Text className="text-lg font-semibold text-foreground">Edit Profile</Text>

          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="min-h-[44px] min-w-[44px] items-end justify-center"
            accessibilityLabel="Save profile changes"
            accessibilityRole="button"
            testID={testID ? `${testID}-save-button` : undefined}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#1E40AF" testID="save-loading" />
            ) : (
              <Text className="text-lg font-semibold text-primary">Save</Text>
            )}
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
          {/* Profile Photo Section */}
          <View className="mb-8 items-center">
            <ProfilePhotoUpload
              currentPhotoUrl={photoUrl}
              onPhotoUploaded={handlePhotoUploaded}
              userId={userId}
              testID={testID ? `${testID}-photo-upload` : undefined}
            />
            <Text className="mt-2 text-sm text-gray-500">Tap to change photo</Text>
          </View>

          {/* Emergency Contact Section */}
          <View className="mb-8">
            <EmergencyContactForm
              values={emergencyContact}
              onChange={handleEmergencyContactChange}
              errors={errors}
              testID={testID ? `${testID}-emergency-form` : undefined}
            />
          </View>

          {/* Info Note */}
          <View className="mb-8 flex-row rounded-lg bg-blue-50 p-4">
            <Ionicons name="information-circle" size={20} color="#1E40AF" />
            <Text className="ml-2 flex-1 text-sm text-gray-700">
              Your name and phone number are managed through your account settings and cannot be
              changed here.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
