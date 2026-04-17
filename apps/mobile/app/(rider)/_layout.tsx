import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';
import { WrongRoleScreen } from '@/components/auth/WrongRoleScreen';

export default function RiderLayout() {
  return (
    <RoleGate
      allowedRoles="rider"
      allowUnresolvedRole
      fallback={<WrongRoleScreen expected="rider" />}>
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
