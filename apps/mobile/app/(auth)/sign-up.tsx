import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  AuthScaffold,
  BrandMark,
  Button,
  Card,
  Link,
  PhoneField,
  ScreenHeader,
  TextField,
  toE164,
} from '@/components/ui';

type ClerkFieldError = {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: { param_name?: string };
};
type ClerkErrorShape = { errors?: ClerkFieldError[] };

const formatUSPhoneFromDigits = (digits: string) => {
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const friendlyMessage = (e: ClerkFieldError): string => {
  const code = e.code ?? '';
  const param = e.meta?.param_name;

  if (code === 'form_param_unknown') {
    return `This Clerk instance doesn't accept "${param ?? 'that field'}". Enable phone number and name in Clerk dashboard → User & Authentication → Email, Phone, Username, and Personal Information.`;
  }
  if (code === 'form_identifier_exists') {
    return 'An account with this phone number already exists. Try signing in instead.';
  }
  if (code === 'form_param_format_invalid' && param === 'phone_number') {
    return 'That phone number format looks wrong. Use 10 digits, e.g. (555) 123-4567.';
  }
  if (code === 'form_param_nil' || code === 'form_param_missing') {
    return `Missing required field: ${param ?? 'unknown'}.`;
  }
  return e.longMessage || e.message || 'Failed to create account';
};

export default function SignUp() {
  const { signUp, isLoaded } = useSignUp();
  const { prefillPhone } = useLocalSearchParams<{ prefillPhone?: string }>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (prefillPhone) {
      const digits = prefillPhone.replace(/\D/g, '').slice(0, 10);
      if (digits.length > 0) setPhone(formatUSPhoneFromDigits(digits));
    }
  }, [prefillPhone]);

  const onSignUp = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      const formattedPhone = toE164(phone);

      await signUp.create({
        phoneNumber: formattedPhone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      await signUp.preparePhoneNumberVerification();

      router.push({
        pathname: '/(auth)/verify',
        params: { phone: formattedPhone, mode: 'sign-up' },
      });
    } catch (err: unknown) {
      const clerkError = err as ClerkErrorShape;
      const firstError = clerkError.errors?.[0];
      setError(firstError ? friendlyMessage(firstError) : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.replace(/\D/g, '').length === 10;

  return (
    <AuthScaffold header={<ScreenHeader />}>
      <View className="items-center">
        <BrandMark size="md" />
      </View>

      <View className="mt-8">
        <Text className="text-center font-sans-bold text-title-1 text-foreground">
          Create your account
        </Text>
        <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
          Join Veterans First for easy, dignified rides.
        </Text>
      </View>

      <Card variant="elevated" padding="lg" className="mt-8">
        <View className="gap-5">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextField
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="John"
                autoComplete="given-name"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <View className="flex-1">
              <TextField
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                autoComplete="family-name"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          <PhoneField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            helperText="We'll text you a 6-digit code."
            error={error || undefined}
            editable={!isLoading}
            testID="phone-input"
          />

          <Button
            label="Create account"
            onPress={onSignUp}
            loading={isLoading}
            disabled={!isValid}
          />
        </View>
      </Card>

      <View className="mt-6 flex-row items-center justify-center gap-2">
        <Text className="font-sans text-body text-ink-secondary">Already have an account?</Text>
        <Link label="Sign in" onPress={() => router.push('/(auth)/sign-in')} />
      </View>
    </AuthScaffold>
  );
}
