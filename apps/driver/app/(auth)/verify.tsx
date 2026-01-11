import { useSignIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function Verify() {
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode: 'sign-in' }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start cooldown timer
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && text) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        onVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
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
          router.replace('/(tabs)');
        }
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const onResendCode = async () => {
    if (resendCooldown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      if (mode === 'sign-in' && signIn) {
        // Create sign-in with identifier
        const { supportedFirstFactors } = await signIn.create({
          identifier: phone,
        });

        // Find the phone_code factor and prepare
        const phoneCodeFactor = supportedFirstFactors?.find(
          (factor) => factor.strategy === 'phone_code'
        );

        if (phoneCodeFactor && 'phoneNumberId' in phoneCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: phoneCodeFactor.phoneNumberId,
          });
        }
      }
      setResendCooldown(60);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      <View className="flex-1 justify-center px-6 py-8">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 top-12 min-h-[48px] min-w-[48px] items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Text className="text-lg text-primary">← Back</Text>
        </Pressable>

        <View className="mb-8">
          <Text className="mb-2 text-center text-3xl font-bold text-foreground">
            Verify Your Phone
          </Text>
          <Text className="text-center text-lg text-gray-600">Enter the 6-digit code sent to</Text>
          <Text className="text-center text-lg font-semibold text-foreground">{phone}</Text>
        </View>

        <View className="mb-6 flex-row justify-center gap-2">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className="min-h-[56px] w-12 rounded-xl border border-gray-300 bg-white text-center text-2xl font-semibold"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              editable={!isLoading}
              autoFocus={index === 0}
              accessibilityLabel={`Digit ${index + 1} of 6`}
            />
          ))}
        </View>

        {error ? <Text className="mb-4 text-center text-base text-red-600">{error}</Text> : null}

        <Pressable
          onPress={() => onVerify()}
          disabled={isLoading || code.join('').length !== 6}
          className={`mb-4 min-h-[56px] items-center justify-center rounded-xl ${
            isLoading || code.join('').length !== 6 ? 'bg-gray-400' : 'bg-primary'
          }`}
          accessibilityLabel="Verify code"
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading || code.join('').length !== 6 }}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">Verify</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onResendCode}
          disabled={resendCooldown > 0 || isLoading}
          className="min-h-[48px] items-center justify-center"
          accessibilityLabel={
            resendCooldown > 0
              ? `Resend code available in ${resendCooldown} seconds`
              : 'Resend verification code'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: resendCooldown > 0 || isLoading }}>
          <Text
            className={`text-center text-base ${
              resendCooldown > 0 ? 'text-gray-400' : 'text-primary'
            }`}>
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
