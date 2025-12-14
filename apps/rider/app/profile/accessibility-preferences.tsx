/**
 * AccessibilityPreferencesScreen
 *
 * Screen for configuring accessibility preferences.
 * Story 2.13: Implement Accessibility Preferences (FR72)
 *
 * AC#1: Configure mobility aids, assistance needs, extra space, special notes
 * AC#2: Preferences saved to rider_preferences, success feedback shown
 * AC#4: All form fields accessible with proper labels and hints
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import { MobilityAidSelector, AssistanceToggles } from '../../src/features/profile/components';
import {
  useAccessibilityPreferences,
  useUpdateAccessibilityPreferences,
  type MobilityAidType,
} from '../../src/features/profile/hooks';

export default function AccessibilityPreferencesScreen() {
  const { data: preferences, isLoading, error, refetch } = useAccessibilityPreferences();
  const updatePreferences = useUpdateAccessibilityPreferences();

  // Local state for form
  const [mobilityAid, setMobilityAid] = useState<MobilityAidType>(null);
  const [needsDoorAssistance, setNeedsDoorAssistance] = useState(false);
  const [needsPackageAssistance, setNeedsPackageAssistance] = useState(false);
  const [extraVehicleSpace, setExtraVehicleSpace] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  // Initialize form with existing preferences
  useEffect(() => {
    if (preferences) {
      setMobilityAid(preferences.mobilityAid);
      setNeedsDoorAssistance(preferences.needsDoorAssistance);
      setNeedsPackageAssistance(preferences.needsPackageAssistance);
      setExtraVehicleSpace(preferences.extraVehicleSpace);
      setSpecialNotes(preferences.specialEquipmentNotes ?? '');
    }
  }, [preferences]);

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await updatePreferences.mutateAsync({
        mobilityAid,
        needsDoorAssistance,
        needsPackageAssistance,
        extraVehicleSpace,
        specialEquipmentNotes: specialNotes || null,
      });
      Alert.alert('Saved', 'Your accessibility preferences have been updated.');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save your preferences. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen
          options={{
            title: 'Accessibility Preferences',
            headerBackTitle: 'Profile',
          }}
        />
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text className="mt-4 text-lg text-gray-600">Loading preferences...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen
          options={{
            title: 'Accessibility Preferences',
            headerBackTitle: 'Profile',
          }}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="mt-4 text-center text-lg text-gray-800">Unable to load preferences</Text>
          <Text className="mt-2 text-center text-base text-gray-600">
            Please check your connection and try again
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-6 h-[56px] w-full items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Retry loading preferences"
            accessibilityRole="button">
            <Text className="text-lg font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'Accessibility Preferences',
          headerBackTitle: 'Profile',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text className="mb-6 text-sm text-gray-600">
            These preferences help drivers prepare for your ride and provide better assistance.
          </Text>

          {/* Mobility Aid Section */}
          <View className="mb-6">
            <MobilityAidSelector
              value={mobilityAid}
              onChange={setMobilityAid}
              testID="mobility-aid-selector"
            />
          </View>

          {/* Assistance Toggles Section */}
          <View className="mb-6">
            <AssistanceToggles
              needsDoorAssistance={needsDoorAssistance}
              needsPackageAssistance={needsPackageAssistance}
              extraVehicleSpace={extraVehicleSpace}
              onDoorAssistanceChange={setNeedsDoorAssistance}
              onPackageAssistanceChange={setNeedsPackageAssistance}
              onExtraSpaceChange={setExtraVehicleSpace}
              testID="assistance-toggles"
            />
          </View>

          {/* Special Notes Section */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">
              Special Equipment Notes
            </Text>
            <Text className="mb-3 text-sm text-gray-600">
              Add any additional details about your mobility equipment or special needs.
            </Text>
            <TextInput
              value={specialNotes}
              onChangeText={setSpecialNotes}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="e.g., Folding wheelchair fits in trunk, need help folding it"
              placeholderTextColor="#9CA3AF"
              className="min-h-[100px] rounded-xl border border-gray-200 bg-white p-4 text-base text-foreground"
              textAlignVertical="top"
              accessibilityLabel="Special equipment notes"
              accessibilityHint="Enter any additional details about your mobility equipment (max 500 characters)"
              testID="special-notes-input"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={updatePreferences.isPending}
            className={`mb-8 min-h-[56px] flex-row items-center justify-center rounded-xl ${
              updatePreferences.isPending ? 'bg-primary/50' : 'bg-primary'
            }`}
            accessibilityLabel="Save accessibility preferences"
            accessibilityRole="button"
            accessibilityState={{ disabled: updatePreferences.isPending }}
            testID="save-button">
            {updatePreferences.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                <Text className="ml-2 text-lg font-semibold text-white">Save Preferences</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
