import { useAuth } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';

import { RoleGate } from '@/components/auth/RoleGate';
import { WrongRoleScreen } from '@/components/auth/WrongRoleScreen';
import { RideOfferModal } from '@/components/trips';

function DriverStack() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trips/[id]" />
        <Stack.Screen name="index" />
      </Stack>
      {/* RideOfferModal shows automatically when there's a pending offer */}
      {isSignedIn && <RideOfferModal testID="ride-offer-modal" />}
    </>
  );
}

export default function DriverLayout() {
  return (
    <RoleGate allowedRoles="driver" fallback={<WrongRoleScreen expected="driver" />}>
      <DriverStack />
    </RoleGate>
  );
}
