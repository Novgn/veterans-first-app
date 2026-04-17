import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';
import { WrongRoleScreen } from '@/components/auth/WrongRoleScreen';

export default function FamilyLayout() {
  return (
    <RoleGate allowedRoles="family" fallback={<WrongRoleScreen expected="family" />}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </RoleGate>
  );
}
