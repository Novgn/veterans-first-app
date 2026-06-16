import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScaffold, BrandMark, Button, Card, Link, PhoneField, toE164 } from '@/components/ui';

type ClerkErrorShape = {
  errors?: { code?: string; message?: string; longMessage?: string }[];
};

// Clerk codes that mean "no account with this phone" — user should sign up.
const NO_ACCOUNT_CODES = new Set([
  'form_identifier_not_found',
  'form_identifier_exists_or_not_found',
]);

export default function SignIn() {
  const { signIn, isLoaded } = useSignIn();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [showSignUpSuggestion, setShowSignUpSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSendCode = async () => {
    if (!isLoaded) return;

    setError('');
    setShowSignUpSuggestion(false);
    setIsLoading(true);

    try {
      const formattedPhone = toE164(phone);

      const { supportedFirstFactors } = await signIn.create({
        identifier: formattedPhone,
      });

      const phoneCodeFactor = supportedFirstFactors?.find(
        (factor) => factor.strategy === 'phone_code'
      );

      if (phoneCodeFactor && 'phoneNumberId' in phoneCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneCodeFactor.phoneNumberId,
        });

        router.push({
          pathname: '/(auth)/verify',
          params: { phone: formattedPhone, mode: 'sign-in' },
        });
      } else {
        setError('Phone authentication is not available for this account.');
      }
    } catch (err: unknown) {
      const clerkError = err as ClerkErrorShape;
      const firstError = clerkError.errors?.[0];
      const code = firstError?.code ?? '';

      if (NO_ACCOUNT_CODES.has(code) || firstError?.message === 'Identifier is invalid.') {
        setError("We couldn't find an account with that phone number.");
        setShowSignUpSuggestion(true);
      } else {
        setError(
          firstError?.longMessage || firstError?.message || 'Failed to send verification code.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignUp = () => {
    const digits = phone.replace(/\D/g, '');
    router.push({
      pathname: '/(auth)/sign-up',
      params: digits.length === 10 ? { prefillPhone: digits } : undefined,
    });
  };

  const isValid = phone.replace(/\D/g, '').length === 10;

  return (
    <AuthScaffold>
      <View className="items-center">
        <BrandMark size="lg" />
      </View>

      <View className="mt-10">
        <Text className="text-center font-sans-bold text-title-1 text-foreground">
          Welcome back
        </Text>
        <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
          Enter your phone number to sign in.
        </Text>
      </View>

      <Card variant="elevated" padding="lg" className="mt-8">
        <View className="gap-5">
          <PhoneField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            helperText="We'll text you a 6-digit code."
            error={error || undefined}
            editable={!isLoading}
          />

          {showSignUpSuggestion ? (
            <Button label="Create an account instead" variant="secondary" onPress={goToSignUp} />
          ) : (
            <Button
              label="Send verification code"
              onPress={onSendCode}
              loading={isLoading}
              disabled={!isValid}
            />
          )}
        </View>
      </Card>

      <View className="mt-6 flex-row items-center justify-center gap-2">
        <Text className="font-sans text-body text-ink-secondary">Don&apos;t have an account?</Text>
        <Link label="Sign up" onPress={goToSignUp} />
      </View>
    </AuthScaffold>
  );
}
