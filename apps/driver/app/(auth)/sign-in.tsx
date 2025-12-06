import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export default function SignIn() {
  const { signIn, isLoaded } = useSignIn();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSendCode = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      // Format phone number - ensure it starts with +1 for US
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;

      await signIn.create({
        strategy: 'phone_code',
        phoneNumber: formattedPhone,
      });

      // Navigate to verification screen with phone number
      router.push({
        pathname: '/(auth)/verify',
        params: { phone: formattedPhone, mode: 'sign-in' },
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAFAF9]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-8">
          <View className="mb-8">
            <Text className="mb-2 text-center text-3xl font-bold text-gray-900">
              Driver Sign In
            </Text>
            <Text className="text-center text-lg text-gray-600">
              Sign in to your Veterans First driver account
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="mb-2 text-base font-medium text-gray-700">Phone Number</Text>
              <View className="flex-row items-center rounded-lg border border-gray-300 bg-white">
                <Text className="pl-4 pr-2 text-lg text-gray-500">+1</Text>
                <TextInput
                  className="h-14 flex-1 px-2 text-lg"
                  placeholder="(555) 123-4567"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!isLoading}
                />
              </View>
            </View>

            {error ? <Text className="text-center text-base text-red-600">{error}</Text> : null}

            <Pressable
              onPress={onSendCode}
              disabled={isLoading || !phone}
              className={`h-14 items-center justify-center rounded-lg ${
                isLoading || !phone ? 'bg-gray-400' : 'bg-[#1E40AF]'
              }`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-semibold text-white">Send Verification Code</Text>
              )}
            </Pressable>

            <View className="mt-4 flex-row justify-center">
              <Text className="text-base text-gray-600">Don&apos;t have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="text-base font-semibold text-[#1E40AF]">Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
