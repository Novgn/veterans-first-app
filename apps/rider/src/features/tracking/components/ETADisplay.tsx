/**
 * ETADisplay Component
 *
 * Displays estimated time of arrival for driver with auto-refresh.
 * Calculates ETA based on distance and average speed.
 *
 * Features:
 * - Auto-refresh every 30 seconds
 * - Screen reader announcements for significant changes
 * - Human-readable time format ("5 min", "< 1 min")
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 * FR11: Riders can track their driver's real-time location and estimated arrival time
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, AccessibilityInfo } from 'react-native';

import { calculateDistance, Coordinates } from './DriverTrackingMap';

interface ETADisplayProps {
  /** Driver's current location */
  driverLocation: Coordinates;
  /** Pickup location */
  pickupLocation: Coordinates;
  /** Average driving speed in mph (default: 25 for urban driving) */
  averageSpeedMph?: number;
  /** Refresh interval in milliseconds (default: 30000 = 30 seconds) */
  refreshIntervalMs?: number;
  /** Optional additional styles */
  className?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Formats ETA minutes into human-readable string
 */
function formatETA(minutes: number): string {
  if (minutes <= 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * ETADisplay shows the estimated arrival time for the driver.
 * Auto-refreshes every 30 seconds and announces changes to screen readers.
 */
export function ETADisplay({
  driverLocation,
  pickupLocation,
  averageSpeedMph = 25, // Urban driving average
  refreshIntervalMs = 30000, // 30 seconds
  className = '',
  testID,
}: ETADisplayProps) {
  const [etaMinutes, setEtaMinutes] = useState<number>(0);
  const lastAnnouncedRef = useRef<number>(0);

  /**
   * Calculates ETA in minutes based on distance and speed
   */
  const calculateETA = useCallback((): number => {
    const distanceMiles = calculateDistance(driverLocation, pickupLocation);
    const timeHours = distanceMiles / averageSpeedMph;
    const timeMinutes = Math.max(1, timeHours * 60);
    return timeMinutes;
  }, [driverLocation, pickupLocation, averageSpeedMph]);

  /**
   * Announces ETA to screen reader if significant change
   */
  const announceIfSignificant = useCallback((newEta: number) => {
    const lastAnnounced = lastAnnouncedRef.current;
    const shouldAnnounce =
      // Announce if change is >= 2 minutes
      Math.abs(newEta - lastAnnounced) >= 2 ||
      // Always announce when arriving soon
      newEta <= 2 ||
      // First announcement
      lastAnnounced === 0;

    if (shouldAnnounce) {
      const message =
        newEta <= 1
          ? 'Driver arriving in less than 1 minute'
          : `Driver arriving in approximately ${Math.round(newEta)} minutes`;

      AccessibilityInfo.announceForAccessibility(message);
      lastAnnouncedRef.current = newEta;
    }
  }, []);

  // Calculate initial ETA and set up refresh interval
  useEffect(() => {
    // Calculate and set initial ETA
    const initialEta = calculateETA();
    setEtaMinutes(initialEta);
    announceIfSignificant(initialEta);

    // Set up refresh interval
    const interval = setInterval(() => {
      const newEta = calculateETA();
      setEtaMinutes(newEta);
      announceIfSignificant(newEta);
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [calculateETA, refreshIntervalMs, announceIfSignificant]);

  // Recalculate immediately when location changes
  useEffect(() => {
    const newEta = calculateETA();
    setEtaMinutes(newEta);
    announceIfSignificant(newEta);
  }, [driverLocation.latitude, driverLocation.longitude, calculateETA, announceIfSignificant]);

  const displayText = formatETA(etaMinutes);
  const accessibilityLabel = `Estimated arrival: ${displayText}`;

  return (
    <View
      className={`flex-row items-center rounded-xl bg-primary/10 px-4 py-3 ${className}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      testID={testID}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/20">
        <Ionicons name="time-outline" size={28} color="#1E40AF" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-sm text-gray-600">Estimated Arrival</Text>
        <Text className="text-2xl font-bold text-primary">{displayText}</Text>
      </View>
    </View>
  );
}

// Export formatETA for testing
export { formatETA };
