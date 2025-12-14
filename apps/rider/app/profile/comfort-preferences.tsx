/**
 * ComfortPreferencesScreen
 *
 * Screen for configuring comfort preferences.
 * Story 2.14: Implement Comfort Preferences (FR73)
 *
 * AC#1: Configure temperature, conversation, music preferences, other notes
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

import {
  TemperatureSelector,
  ConversationSelector,
  MusicSelector,
} from '../../src/features/profile/components';
import {
  useComfortPreferences,
  useUpdateComfortPreferences,
  type TemperaturePreference,
  type ConversationPreference,
  type MusicPreference,
} from '../../src/features/profile/hooks';

export default function ComfortPreferencesScreen() {
  const { data: preferences, isLoading, error, refetch } = useComfortPreferences();
  const updatePreferences = useUpdateComfortPreferences();

  // Local state for form
  const [temperature, setTemperature] = useState<TemperaturePreference>(null);
  const [conversation, setConversation] = useState<ConversationPreference>(null);
  const [music, setMusic] = useState<MusicPreference>(null);
  const [otherNotes, setOtherNotes] = useState('');

  // Initialize form with existing preferences
  useEffect(() => {
    if (preferences) {
      setTemperature(preferences.comfortTemperature);
      setConversation(preferences.conversationPreference);
      setMusic(preferences.musicPreference);
      setOtherNotes(preferences.otherNotes ?? '');
    }
  }, [preferences]);

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await updatePreferences.mutateAsync({
        comfortTemperature: temperature,
        conversationPreference: conversation,
        musicPreference: music,
        otherNotes: otherNotes || null,
      });
      Alert.alert('Saved', 'Your comfort preferences have been updated.');
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
            title: 'Comfort Preferences',
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
            title: 'Comfort Preferences',
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
          title: 'Comfort Preferences',
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
            Let your driver know your preferences for a more comfortable ride.
          </Text>

          {/* Temperature Section */}
          <View className="mb-6">
            <TemperatureSelector
              value={temperature}
              onChange={setTemperature}
              testID="temperature-selector"
            />
          </View>

          {/* Conversation Section */}
          <View className="mb-6">
            <ConversationSelector
              value={conversation}
              onChange={setConversation}
              testID="conversation-selector"
            />
          </View>

          {/* Music Section */}
          <View className="mb-6">
            <MusicSelector value={music} onChange={setMusic} testID="music-selector" />
          </View>

          {/* Other Notes Section */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">Other Notes</Text>
            <Text className="mb-3 text-sm text-gray-600">
              Any other preferences you&apos;d like your driver to know about.
            </Text>
            <TextInput
              value={otherNotes}
              onChangeText={setOtherNotes}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="e.g., I prefer windows up, or I like to sit in the back right seat"
              placeholderTextColor="#9CA3AF"
              className="min-h-[100px] rounded-xl border border-gray-200 bg-white p-4 text-base text-foreground"
              textAlignVertical="top"
              accessibilityLabel="Other notes"
              accessibilityHint="Enter any additional preferences for your driver (max 500 characters)"
              testID="other-notes-input"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={updatePreferences.isPending}
            className={`mb-8 min-h-[56px] flex-row items-center justify-center rounded-xl ${
              updatePreferences.isPending ? 'bg-primary/50' : 'bg-primary'
            }`}
            accessibilityLabel="Save comfort preferences"
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
