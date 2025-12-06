import { useSignUp } from '@clerk/clerk-expo';
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

export default function SignUp() {
  const { signUp, isLoaded } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSignUp = async () => {
    if (!isLoaded) return;

    setError('');
    setIsLoading(true);

    try {
      // Format phone number - ensure it starts with +1 for US
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;

      await signUp.create({
        phoneNumber: formattedPhone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Prepare phone verification
      await signUp.preparePhoneNumberVerification();

      // Navigate to verification screen
      router.push({
        pathname: '/(auth)/verify',
        params: { phone: formattedPhone, mode: 'sign-up' },
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && phone;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAFAF9]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-8">
          <View className="mb-8">
            <Text className="mb-2 text-center text-3xl font-bold text-gray-900">
              Driver Registration
            </Text>
            <Text className="text-center text-lg text-gray-600">
              Join Veterans First as a driver
            </Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="mb-2 text-base font-medium text-gray-700">First Name</Text>
                <TextInput
                  className="h-14 rounded-lg border border-gray-300 bg-white px-4 text-lg"
                  placeholder="John"
                  autoComplete="given-name"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-base font-medium text-gray-700">Last Name</Text>
                <TextInput
                  className="h-14 rounded-lg border border-gray-300 bg-white px-4 text-lg"
                  placeholder="Doe"
                  autoComplete="family-name"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isLoading}
                />
              </View>
            </View>

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
              onPress={onSignUp}
              disabled={isLoading || !isFormValid}
              className={`h-14 items-center justify-center rounded-lg ${
                isLoading || !isFormValid ? 'bg-gray-400' : 'bg-[#1E40AF]'
              }`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-lg font-semibold text-white">Register as Driver</Text>
              )}
            </Pressable>

            <View className="mt-4 flex-row justify-center">
              <Text className="text-base text-gray-600">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="text-base font-semibold text-[#1E40AF]">Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
