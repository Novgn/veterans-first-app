/**
 * Add Family Member screen (Story 4.1).
 *
 * Simple form: phone number + optional relationship label. On submit we
 * insert a `pending` family_links row and surface any server error
 * inline. The invitee is notified to accept via their family dashboard
 * once they sign in with that phone.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useInviteFamilyMember } from '@/hooks/useFamilyLinks';

const RELATIONSHIPS = ['Daughter', 'Son', 'Spouse', 'Parent', 'Sibling', 'Other'];

export default function AddFamilyMemberScreen() {
  const invite = useInviteFamilyMember();
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      await invite.mutateAsync({ phone, relationship });
      Alert.alert('Invitation sent', 'They can approve access from their Veterans First app.');
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send invitation');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Add Family Member' }} />

      <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="mb-2 text-lg font-semibold text-foreground">Phone number</Text>
        <Text className="mb-3 text-sm text-gray-600">
          We&apos;ll invite this person to access your ride information. They&apos;ll need to
          approve the request on their end.
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="(555) 123-4567"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          className="mb-6 min-h-[48px] rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
          accessibilityLabel="Family member phone number"
          testID="family-invite-phone-input"
        />

        <Text className="mb-2 text-lg font-semibold text-foreground">Relationship (optional)</Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {RELATIONSHIPS.map((label) => {
            const selected = relationship === label;
            return (
              <Pressable
                key={label}
                onPress={() => setRelationship(selected ? null : label)}
                className={`min-h-[44px] items-center justify-center rounded-full border px-4 ${
                  selected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                }`}
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                accessibilityRole="button">
                <Text className={`font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View className="mb-4 flex-row items-center rounded-lg bg-red-50 p-3">
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text className="ml-2 flex-1 text-sm text-red-700">{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={invite.isPending || phone.trim() === ''}
          className={`min-h-[56px] flex-row items-center justify-center rounded-xl ${
            invite.isPending || phone.trim() === '' ? 'bg-gray-300' : 'bg-primary'
          }`}
          accessibilityLabel="Send invitation"
          accessibilityRole="button"
          testID="family-invite-submit-button">
          {invite.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text className="ml-2 text-lg font-semibold text-white">Send Invitation</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
