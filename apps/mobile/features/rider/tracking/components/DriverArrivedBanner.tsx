/**
 * DriverArrivedBanner Component
 *
 * Displays a prominent banner when the driver has arrived at pickup location.
 * Includes haptic feedback and screen reader announcement.
 *
 * Features:
 * - Prominent "Driver Arrived" message
 * - Vehicle description reminder
 * - Haptic feedback on mount
 * - Screen reader announcement
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 * FR11: Riders can track their driver's real-time location and estimated arrival time
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { View, Text, AccessibilityInfo, Platform } from 'react-native';

interface DriverInfo {
  /** Driver's first name */
  firstName: string;
  /** Vehicle color */
  vehicleColor: string;
  /** Vehicle make */
  vehicleMake: string;
  /** Vehicle model */
  vehicleModel: string;
}

interface DriverArrivedBannerProps {
  /** Driver information for the arrival message */
  driver: DriverInfo;
  /** Optional additional styles */
  className?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * DriverArrivedBanner displays a prominent notification when the driver arrives.
 * Triggers haptic feedback and announces to screen readers on mount.
 */
export function DriverArrivedBanner({ driver, className = '', testID }: DriverArrivedBannerProps) {
  const hasAnnouncedRef = useRef(false);

  useEffect(() => {
    // Only trigger once when banner first appears
    if (!hasAnnouncedRef.current) {
      hasAnnouncedRef.current = true;

      // Trigger haptic feedback (native only)
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Announce to screen reader
      const message = `${driver.firstName} has arrived! Look for a ${driver.vehicleColor} ${driver.vehicleMake} ${driver.vehicleModel}`;
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [driver.firstName, driver.vehicleColor, driver.vehicleMake, driver.vehicleModel]);

  const vehicleDescription = `${driver.vehicleColor} ${driver.vehicleMake} ${driver.vehicleModel}`;
  const accessibilityLabel = `Driver arrived. ${driver.firstName} has arrived in a ${vehicleDescription}`;

  return (
    <View
      className={`rounded-2xl bg-green-50 p-4 ${className}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="alert"
      testID={testID}>
      {/* Success icon and header */}
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500">
          <Ionicons name="checkmark" size={28} color="white" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-green-800">Driver Arrived!</Text>
          <Text className="mt-1 text-base text-green-700">
            {driver.firstName} is waiting for you
          </Text>
        </View>
      </View>

      {/* Vehicle info reminder */}
      <View className="mt-4 flex-row items-center rounded-xl bg-green-100 p-3">
        <Ionicons name="car" size={24} color="#15803D" />
        <View className="ml-3 flex-1">
          <Text className="text-sm text-green-600">Look for</Text>
          <Text className="text-base font-semibold text-green-800">{vehicleDescription}</Text>
        </View>
      </View>
    </View>
  );
}
