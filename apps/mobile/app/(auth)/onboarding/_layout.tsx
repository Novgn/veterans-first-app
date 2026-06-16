import { Stack } from 'expo-router';

// Warm-stone canvas (#F4F1EA) behind every onboarding step — keeps the Veteran
// Honor surface continuous and avoids a default-white flash between transitions.
// Each screen also sets bg-background via AuthScaffold; this covers the gaps.
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: '#F4F1EA' },
      }}>
      <Stack.Screen name="veteran" />
      <Stack.Screen name="address" />
      <Stack.Screen name="emergency-contact" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="permissions-location" />
      <Stack.Screen name="permissions-notifications" />
    </Stack>
  );
}
