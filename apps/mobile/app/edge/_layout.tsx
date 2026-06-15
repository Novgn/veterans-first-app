import { Stack } from 'expo-router';

export default function EdgeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="offline" />
      <Stack.Screen name="update-required" />
      <Stack.Screen name="account-suspended" />
    </Stack>
  );
}
