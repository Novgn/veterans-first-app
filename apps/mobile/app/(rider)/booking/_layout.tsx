/**
 * Booking flow stack navigator layout.
 *
 * Manages the 3-tap booking wizard flow:
 * - Step 1: Where (Destination Selection) - index.tsx
 * - Step 2: When (Time Selection) - time.tsx (Story 2.4)
 * - Step 3: Confirm (Booking Confirmation) - confirm.tsx (Story 2.5)
 */

import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Book a Ride',
        }}
      />
      <Stack.Screen
        name="time"
        options={{
          title: 'Select Time',
        }}
      />
      <Stack.Screen
        name="confirm"
        options={{
          title: 'Confirm Booking',
        }}
      />
    </Stack>
  );
}
