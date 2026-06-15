import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="veteran" />
      <Stack.Screen name="address" />
      <Stack.Screen name="emergency-contact" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="permissions-location" />
      <Stack.Screen name="permissions-notifications" />
    </Stack>
  );
}
