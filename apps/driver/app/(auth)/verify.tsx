import { useSignIn, useSignUp } from '@clerk/clerk-expo';
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
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode: 'sign-in' | 'sign-up' }>();
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
          router.replace('/(app)');
        }
      } else if (mode === 'sign-up' && signUp) {
        const result = await signUp.attemptPhoneNumberVerification({
          code: codeToVerify,
        });

        if (result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId });
          router.replace('/(app)');
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
        await signIn.create({
          strategy: 'phone_code',
          phoneNumber: phone,
        });
      } else if (mode === 'sign-up' && signUp) {
        await signUp.preparePhoneNumberVerification();
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
      className="flex-1 bg-[#FAFAF9]">
      <View className="flex-1 justify-center px-6 py-8">
        <Pressable onPress={() => router.back()} className="absolute left-4 top-12">
          <Text className="text-lg text-[#1E40AF]">← Back</Text>
        </Pressable>

        <View className="mb-8">
          <Text className="mb-2 text-center text-3xl font-bold text-gray-900">
            Verify Your Phone
          </Text>
          <Text className="text-center text-lg text-gray-600">Enter the 6-digit code sent to</Text>
          <Text className="text-center text-lg font-semibold text-gray-900">{phone}</Text>
        </View>

        <View className="mb-6 flex-row justify-center space-x-2">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className="h-14 w-12 rounded-lg border border-gray-300 bg-white text-center text-2xl font-semibold"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              editable={!isLoading}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error ? <Text className="mb-4 text-center text-base text-red-600">{error}</Text> : null}

        <Pressable
          onPress={() => onVerify()}
          disabled={isLoading || code.join('').length !== 6}
          className={`mb-4 h-14 items-center justify-center rounded-lg ${
            isLoading || code.join('').length !== 6 ? 'bg-gray-400' : 'bg-[#1E40AF]'
          }`}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">Verify</Text>
          )}
        </Pressable>

        <Pressable onPress={onResendCode} disabled={resendCooldown > 0 || isLoading}>
          <Text
            className={`text-center text-base ${
              resendCooldown > 0 ? 'text-gray-400' : 'text-[#1E40AF]'
            }`}>
            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
