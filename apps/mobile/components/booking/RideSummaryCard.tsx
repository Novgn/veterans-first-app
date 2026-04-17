/**
 * RideSummaryCard Component
 *
 * Visual summary card showing route, date, time, and recurring info.
 * Provides clear at-a-glance confirmation of booking details.
 *
 * Features:
 * - Visual route indicator (origin dot → line → destination dot)
 * - Pickup and destination display
 * - Date and time with icons
 * - Recurring ride indicator when applicable
 * - Card with 16px radius, 20px padding per UX spec
 * - Full accessibility support
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import type { Destination } from '@/stores/bookingStore';

interface RideSummaryCardProps {
  /** Pickup location (null = Home) */
  pickup: Destination | null;
  /** Destination location */
  dropoff: Destination;
  /** Selected date (ISO format: YYYY-MM-DD) */
  date: string;
  /** Selected time (e.g., "10:30 AM") or null for ASAP */
  time: string | null;
  /** Whether this is a recurring ride */
  isRecurring?: boolean;
  /** Human-readable recurring description */
  recurringDescription?: string;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Formats a date string into user-friendly display.
 * Shows "Today", "Tomorrow", or formatted date.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (inputDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function RideSummaryCard({
  pickup,
  dropoff,
  date,
  time,
  isRecurring = false,
  recurringDescription,
  className = '',
}: RideSummaryCardProps) {
  const formattedDate = formatDate(date);
  const displayTime = time || 'ASAP';
  const pickupName = pickup?.name || 'Home';
  const pickupAddress = pickup?.address;

  const accessibilityLabel = `Ride summary: From ${pickupName} to ${dropoff.name} on ${formattedDate} at ${displayTime}${isRecurring ? `. ${recurringDescription || 'Recurring ride'}` : ''}`;

  return (
    <View
      className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}
      accessible={true}
      accessibilityLabel={accessibilityLabel}>
      {/* Route visualization */}
      <View className="flex-row">
        {/* Route line indicator */}
        <View className="mr-4 items-center">
          <View className="h-3 w-3 rounded-full bg-secondary" />
          <View className="h-12 w-0.5 bg-gray-300" />
          <View className="h-3 w-3 rounded-full bg-primary" />
        </View>

        {/* Locations */}
        <View className="flex-1">
          {/* Pickup */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500">From</Text>
            <Text className="text-lg font-semibold text-foreground">{pickupName}</Text>
            {pickupAddress && <Text className="text-base text-gray-600">{pickupAddress}</Text>}
          </View>

          {/* Destination */}
          <View>
            <Text className="text-sm font-medium text-gray-500">To</Text>
            <Text className="text-lg font-semibold text-foreground">{dropoff.name}</Text>
            <Text className="text-base text-gray-600">{dropoff.address}</Text>
          </View>
        </View>
      </View>

      {/* Date and Time */}
      <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4">
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        <Text className="ml-2 text-lg font-medium text-foreground">{formattedDate}</Text>
        <View className="mx-3 h-1 w-1 rounded-full bg-gray-400" />
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <Text className="ml-2 text-lg font-medium text-foreground">{displayTime}</Text>
      </View>

      {/* Recurring indicator */}
      {isRecurring && (
        <View className="mt-3 flex-row items-center">
          <Ionicons name="repeat" size={18} color="#059669" />
          <Text className="ml-2 text-base text-secondary">
            {recurringDescription || 'Recurring ride'}
          </Text>
        </View>
      )}
    </View>
  );
}
