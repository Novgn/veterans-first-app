/**
 * EditDriverProfileSheet (Story 3.11)
 *
 * Lightweight bottom-sheet form for editing vehicle + personal info. Validates
 * required fields (first name, last name, vehicle make/model/color/plate) and
 * blocks submit until they're filled.
 */

import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { DriverProfile, DriverProfileUpdate } from '@/hooks/useDriverProfile';

export interface EditDriverProfileSheetProps {
  visible: boolean;
  initial: DriverProfile;
  onClose: () => void;
  onSubmit: (input: DriverProfileUpdate) => Promise<void> | void;
  isSubmitting?: boolean;
  testID?: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlate: string;
  bio: string;
  yearsExperience: string;
}

function toForm(profile: DriverProfile): FormState {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email ?? '',
    vehicleMake: profile.vehicleMake,
    vehicleModel: profile.vehicleModel,
    vehicleYear: profile.vehicleYear ?? '',
    vehicleColor: profile.vehicleColor,
    vehiclePlate: profile.vehiclePlate,
    bio: profile.bio ?? '',
    yearsExperience: profile.yearsExperience ?? '',
  };
}

export function validateDriverProfileForm(form: FormState): string | null {
  if (!form.firstName.trim()) return 'First name is required';
  if (!form.lastName.trim()) return 'Last name is required';
  if (!form.vehicleMake.trim()) return 'Vehicle make is required';
  if (!form.vehicleModel.trim()) return 'Vehicle model is required';
  if (!form.vehicleColor.trim()) return 'Vehicle color is required';
  if (!form.vehiclePlate.trim()) return 'Vehicle plate is required';
  return null;
}

export function EditDriverProfileSheet({
  visible,
  initial,
  onClose,
  onSubmit,
  isSubmitting,
  testID,
}: EditDriverProfileSheetProps) {
  const [form, setForm] = useState<FormState>(() => toForm(initial));

  useEffect(() => {
    if (visible) setForm(toForm(initial));
  }, [visible, initial]);

  const handleChange = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    const err = validateDriverProfileForm(form);
    if (err) {
      Alert.alert('Missing info', err);
      return;
    }

    await onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || null,
      vehicleMake: form.vehicleMake.trim(),
      vehicleModel: form.vehicleModel.trim(),
      vehicleYear: form.vehicleYear.trim() || null,
      vehicleColor: form.vehicleColor.trim(),
      vehiclePlate: form.vehiclePlate.trim(),
      bio: form.bio.trim() || null,
      yearsExperience: form.yearsExperience.trim() || null,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50">
        <View className="max-h-[90%] rounded-t-3xl bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-bold text-foreground">Edit Profile</Text>
          </View>
          <ScrollView className="px-6 py-4">
            {(
              [
                { key: 'firstName', label: 'First name', type: 'text' },
                { key: 'lastName', label: 'Last name', type: 'text' },
                { key: 'email', label: 'Email (optional)', type: 'email' },
                { key: 'vehicleMake', label: 'Vehicle make', type: 'text' },
                { key: 'vehicleModel', label: 'Vehicle model', type: 'text' },
                { key: 'vehicleYear', label: 'Vehicle year (optional)', type: 'text' },
                { key: 'vehicleColor', label: 'Vehicle color', type: 'text' },
                { key: 'vehiclePlate', label: 'Vehicle plate', type: 'text' },
                { key: 'yearsExperience', label: 'Years driving (optional)', type: 'text' },
              ] as const
            ).map((field) => (
              <View key={field.key} className="mb-3">
                <Text className="mb-1 text-sm font-semibold text-gray-700">{field.label}</Text>
                <TextInput
                  value={form[field.key]}
                  onChangeText={handleChange(field.key)}
                  className="min-h-[48px] rounded-xl border border-gray-300 bg-white px-3"
                  keyboardType={field.type === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={field.type === 'email' ? 'none' : 'words'}
                  accessibilityLabel={field.label}
                  testID={`field-${field.key}`}
                />
              </View>
            ))}

            <View className="mb-3">
              <Text className="mb-1 text-sm font-semibold text-gray-700">Bio (optional)</Text>
              <TextInput
                value={form.bio}
                onChangeText={handleChange('bio')}
                multiline
                numberOfLines={4}
                className="min-h-[96px] rounded-xl border border-gray-300 bg-white px-3 py-2"
                accessibilityLabel="Bio"
                testID="field-bio"
              />
            </View>
          </ScrollView>

          <View className="flex-row gap-3 border-t border-gray-200 px-6 py-4">
            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              className="min-h-[56px] flex-1 items-center justify-center rounded-xl border-2 border-gray-300"
              accessibilityLabel="Cancel"
              accessibilityRole="button">
              <Text className="text-lg font-semibold text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isSubmitting}
              className={`min-h-[56px] flex-1 items-center justify-center rounded-xl ${
                isSubmitting ? 'bg-gray-300' : 'bg-primary'
              }`}
              accessibilityLabel="Save profile"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              testID="save-driver-profile">
              <Text className="text-lg font-semibold text-white">
                {isSubmitting ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
