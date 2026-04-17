import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';
import { WrongRoleScreen } from '@/components/auth/WrongRoleScreen';

export default function FamilyLayout() {
  return (
    <RoleGate allowedRoles="family" fallback={<WrongRoleScreen expected="family" />}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FAFAF9' },
          headerTintColor: '#1E40AF',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="rider/[id]/index" options={{ title: 'Rides' }} />
        <Stack.Screen name="rider/[id]/ride/[rideId]" options={{ title: 'Ride' }} />
      </Stack>
    </RoleGate>
  );
}
