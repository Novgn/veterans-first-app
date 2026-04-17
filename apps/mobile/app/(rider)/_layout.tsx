import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';

export default function RiderLayout() {
  // Default role for unset users is 'rider' (most common). Story 1.5.4 will
  // tighten the gate once the Supabase user_roles → Clerk sync is wired.
  return (
    <RoleGate allowedRoles={['rider', 'family']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="rides/[id]" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="index" />
      </Stack>
    </RoleGate>
  );
}
