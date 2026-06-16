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
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

import { MobilityAidSelector, AssistanceToggles } from '@/components/profile';
import { Button } from '@/components/ui';
import {
  useAccessibilityPreferences,
  useUpdateAccessibilityPreferences,
  type MobilityAidType,
} from '@/hooks';

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
        <ActivityIndicator size="large" color="#1F3A5F" />
        <Text className="mt-4 font-sans text-body text-ink-secondary">Loading preferences...</Text>
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
          <Ionicons name="alert-circle-outline" size={48} color="#A83A35" />
          <Text className="mt-4 text-center font-sans-semibold text-headline text-foreground">
            Unable to load preferences
          </Text>
          <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
            Please check your connection and try again
          </Text>
          <View className="mt-6 w-full">
            <Button
              label="Try Again"
              onPress={() => refetch()}
              accessibilityLabel="Retry loading preferences"
            />
          </View>
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
          <Text className="mb-6 font-sans text-footnote text-ink-secondary">
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
            <Text className="mb-3 font-sans-semibold text-headline text-foreground">
              Special Equipment Notes
            </Text>
            <Text className="mb-3 font-sans text-footnote text-ink-secondary">
              Add any additional details about your mobility equipment or special needs.
            </Text>
            <TextInput
              value={specialNotes}
              onChangeText={setSpecialNotes}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="e.g., Folding wheelchair fits in trunk, need help folding it"
              placeholderTextColor="#4F4A41"
              className="border-strong min-h-[100px] rounded-sm border bg-card p-4 font-sans text-body text-foreground"
              textAlignVertical="top"
              accessibilityLabel="Special equipment notes"
              accessibilityHint="Enter any additional details about your mobility equipment (max 500 characters)"
              testID="special-notes-input"
            />
          </View>

          {/* Save Button */}
          <View className="mb-8">
            <Button
              label="Save Preferences"
              onPress={handleSave}
              loading={updatePreferences.isPending}
              disabled={updatePreferences.isPending}
              leftIcon={<Ionicons name="checkmark" size={24} color="#FFFFFF" />}
              accessibilityLabel="Save accessibility preferences"
              testID="save-button"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
