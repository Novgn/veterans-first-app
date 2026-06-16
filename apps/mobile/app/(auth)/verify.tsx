import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScaffold, Button, Card, Link, OTPField, ScreenHeader } from '@/components/ui';

const RESEND_COOLDOWN_SECONDS = 45;
const HAS_SEEN_WELCOME_KEY = 'veteransfirst.hasSeenWelcome';

const markWelcomeSeen = async () => {
  try {
    await AsyncStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
  } catch {
    // Non-fatal: routing continues even if persistence fails.
  }
};

const maskPhone = (e164: string) => {
  const digits = e164.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return e164;
  return `(•••) •••-${digits.slice(6)}`;
};

export default function Verify() {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode: 'sign-in' | 'sign-up' }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onVerify = async (fullCode?: string) => {
    const codeToVerify = fullCode ?? code;
    if (codeToVerify.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (mode === 'sign-in' && signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code: codeToVerify,
        });
        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          await markWelcomeSeen();
          router.replace('/');
        } else if (result.status === 'needs_second_factor') {
          setError('Two-factor authentication is required but not yet supported in this app.');
        } else {
          console.warn('[verify] unexpected sign-in status', result.status, result);
          setError(`Sign-in needs another step (${result.status}). Contact support.`);
        }
      } else if (mode === 'sign-up' && signUp) {
        const result = await signUp.attemptPhoneNumberVerification({ code: codeToVerify });
        if (result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId });
          await markWelcomeSeen();
          router.replace('/(auth)/onboarding/veteran');
        } else if (result.status === 'missing_requirements') {
          const missing = (result.missingFields ?? []).join(', ') || 'required fields';
          console.warn('[verify] sign-up missing_requirements', result);
          setError(
            `Your account is verified, but Clerk still needs: ${missing}. Enable/disable these in Clerk dashboard → User & Authentication.`
          );
        } else {
          console.warn('[verify] unexpected sign-up status', result.status, result);
          setError(`Sign-up needs another step (${result.status}). Contact support.`);
        }
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message?: string; longMessage?: string }[] };
      const first = clerkError.errors?.[0];
      setError(first?.longMessage || first?.message || 'Invalid verification code');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (resendCooldown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      if (mode === 'sign-in' && signIn) {
        const { supportedFirstFactors } = await signIn.create({ identifier: phone });
        const phoneCodeFactor = supportedFirstFactors?.find(
          (factor) => factor.strategy === 'phone_code'
        );
        if (phoneCodeFactor && 'phoneNumberId' in phoneCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: phoneCodeFactor.phoneNumberId,
          });
        }
      } else if (mode === 'sign-up' && signUp) {
        await signUp.preparePhoneNumberVerification();
      }
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScaffold header={<ScreenHeader />}>
      <View>
        <Text className="text-center font-sans-bold text-title-1 text-foreground">
          Enter the code
        </Text>
        <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
          We sent a 6-digit code to {maskPhone(phone ?? '')}.
        </Text>
        <View className="mt-2 items-center">
          <Link label="Change number" onPress={() => router.back()} size="sm" />
        </View>
      </View>

      <Card variant="elevated" padding="lg" className="mt-10">
        <OTPField
          value={code}
          onChange={setCode}
          onComplete={onVerify}
          disabled={isLoading}
          error={error || undefined}
        />

        <View className="mt-6 items-center">
          {resendCooldown > 0 ? (
            <Text className="font-sans text-body text-ink-secondary">
              Resend code in 0:{resendCooldown.toString().padStart(2, '0')}
            </Text>
          ) : (
            <Link label="Resend code" onPress={onResend} />
          )}
        </View>
      </Card>

      <View className="mt-8">
        <Button
          label="Continue"
          onPress={() => onVerify()}
          loading={isLoading}
          disabled={code.length !== 6}
        />
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-2">
        <Text className="font-sans text-footnote text-ink-secondary">Didn&apos;t get it?</Text>
        <Link label="Call us anytime" size="sm" onPress={() => router.push('/support')} />
      </View>
    </AuthScaffold>
  );
}
