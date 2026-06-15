/**
 * Delete Account Screen
 *
 * In-app account deletion flow required by Apple Guideline 5.1.1(v).
 *
 * Flow:
 * 1. User is informed what will be removed and that the action is irreversible.
 * 2. User must type "DELETE" (exact, case-sensitive) to enable the destructive button.
 * 3. On confirm, we call Clerk's `user.delete()`, clear the welcome flag, and send
 *    the user back to the welcome screen. Clerk clears the session automatically.
 *
 * Note: Supabase cascade (user_profiles, rides, etc.) is handled server-side via
 * the Clerk `user.deleted` webhook and is out of scope for this screen.
 */

import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AuthScaffold, Button, ScreenHeader, TextField } from '@/components/ui';

const HAS_SEEN_WELCOME_KEY = 'veteransfirst.hasSeenWelcome';
const CONFIRMATION_PHRASE = 'DELETE';

export default function DeleteAccount() {
  const router = useRouter();
  const { user } = useUser();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmation === CONFIRMATION_PHRASE;
  const isButtonDisabled = !isConfirmed || isDeleting || !user;

  const onDelete = async () => {
    if (!user || !isConfirmed) return;

    // TODO: block delete if active ride exists (follow-up story once ride APIs are available).

    setError('');
    setIsDeleting(true);

    try {
      await user.delete();
      try {
        await AsyncStorage.removeItem(HAS_SEEN_WELCOME_KEY);
      } catch {
        // Non-fatal: navigation continues even if the flag can't be cleared.
      }
      router.replace('/(auth)/welcome');
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(
        clerkError.errors?.[0]?.message ||
          'We couldn\u2019t delete your account. Please try again or contact support.'
      );
      setIsDeleting(false);
    }
  };

  const onCancel = () => {
    if (isDeleting) return;
    router.back();
  };

  return (
    <AuthScaffold header={<ScreenHeader title="Delete account" />}>
      <View>
        <Text className="text-title-1 text-foreground">Delete your account?</Text>

        <Text className="text-stone-600 mt-4 text-body">
          Deleting your account will permanently remove:
          {'\n'}• Your profile and veteran information
          {'\n'}• Your saved addresses and payment methods
          {'\n'}• Your ride history and receipts
          {'\n'}
          {'\n'}This action cannot be undone. Active rides must be completed or cancelled first.
        </Text>

        <View className="mt-6 flex-row items-start gap-3 rounded-xl bg-error/10 p-4">
          <Ionicons name="warning" size={22} color="#DC2626" />
          <Text className="flex-1 text-body font-bold text-error">This cannot be undone.</Text>
        </View>

        <View className="mt-8">
          <TextField
            label={`Type "${CONFIRMATION_PHRASE}" to confirm`}
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            editable={!isDeleting}
            accessibilityLabel={`Type ${CONFIRMATION_PHRASE} to confirm account deletion`}
            testID="delete-account-confirmation-input"
          />
        </View>

        {error ? (
          <Text className="mt-4 text-body text-error" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <View className="mt-8">
          <Pressable
            onPress={onDelete}
            disabled={isButtonDisabled}
            accessibilityRole="button"
            accessibilityLabel="Delete my account"
            accessibilityState={{ disabled: isButtonDisabled, busy: isDeleting }}
            className={`min-h-[56px] w-full flex-row items-center justify-center rounded-xl px-6 ${
              isButtonDisabled ? 'bg-error/40' : 'bg-error active:opacity-90'
            }`}
            testID="delete-account-confirm-button">
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-body font-bold text-white">Delete my account</Text>
            )}
          </Pressable>
        </View>

        <View className="mt-3">
          <Button
            label="Cancel"
            variant="secondary"
            onPress={onCancel}
            disabled={isDeleting}
            testID="delete-account-cancel-button"
          />
        </View>
      </View>
    </AuthScaffold>
  );
}
