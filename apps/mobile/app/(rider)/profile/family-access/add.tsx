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
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui';
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
        <Text className="mb-2 font-sans-semibold text-headline text-foreground">Phone number</Text>
        <Text className="mb-3 font-sans text-footnote text-ink-secondary">
          We&apos;ll invite this person to access your ride information. They&apos;ll need to
          approve the request on their end.
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="(555) 123-4567"
          placeholderTextColor="#4F4A41"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          className="border-strong mb-6 min-h-[56px] rounded-sm border bg-card px-4 py-3 font-sans text-body text-foreground"
          accessibilityLabel="Family member phone number"
          testID="family-invite-phone-input"
        />

        <Text className="mb-2 font-sans-semibold text-headline text-foreground">
          Relationship (optional)
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {RELATIONSHIPS.map((label) => {
            const selected = relationship === label;
            return (
              <Pressable
                key={label}
                onPress={() => setRelationship(selected ? null : label)}
                className={`min-h-[48px] items-center justify-center rounded-full border-2 px-4 ${
                  selected ? 'border-primary bg-primary' : 'border-strong bg-card'
                }`}
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                accessibilityRole="button">
                <Text className={`font-sans-medium ${selected ? 'text-white' : 'text-foreground'}`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View className="mb-4 flex-row items-center rounded-lg bg-error-100 p-3">
            <Ionicons name="alert-circle" size={18} color="#A83A35" />
            <Text className="ml-2 flex-1 font-sans text-footnote text-error">{error}</Text>
          </View>
        ) : null}

        <Button
          label="Send Invitation"
          onPress={handleSubmit}
          disabled={invite.isPending || phone.trim() === ''}
          loading={invite.isPending}
          leftIcon={<Ionicons name="send" size={20} color="#ffffff" />}
          accessibilityLabel="Send invitation"
          testID="family-invite-submit-button"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
