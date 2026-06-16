import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';
import { WrongRoleScreen } from '@/components/auth/WrongRoleScreen';

export default function FamilyLayout() {
  return (
    <RoleGate allowedRoles="family" fallback={<WrongRoleScreen expected="family" />}>
      <Stack
        screenOptions={{
          // Veteran Honor: warm stone canvas, navy controls, Lexend semibold title.
          headerStyle: { backgroundColor: '#F4F1EA' },
          headerTintColor: '#1F3A5F',
          headerTitleStyle: { fontFamily: 'Lexend_600SemiBold', fontSize: 18 },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="rider/[id]/index" options={{ title: 'Rides' }} />
        <Stack.Screen
          name="rider/[id]/book"
          options={{ title: 'Book a Ride', presentation: 'modal' }}
        />
        <Stack.Screen name="rider/[id]/ride/[rideId]" options={{ title: 'Ride' }} />
      </Stack>
    </RoleGate>
  );
}
