import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';

export default function FamilyLayout() {
  return (
    <RoleGate allowedRoles="family">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </RoleGate>
  );
}
