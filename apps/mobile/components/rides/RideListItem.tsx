/**
 * RideListItem Component
 *
 * Compact ride card for use in ride lists.
 * Tappable to navigate to ride details.
 *
 * Features:
 * - Compact route display
 * - Status badge
 * - Date and time
 * - 48dp+ touch target
 * - Full accessibility support
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { Ride } from '@/hooks/useRide';

interface RideListItemProps {
  /** Ride data */
  ride: Ride;
  /** Callback when item is pressed */
  onPress: () => void;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Returns status badge color based on ride status.
 */
function getStatusColor(status: Ride['status']): { bg: string; text: string } {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'assigned':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'in_progress':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'completed':
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
}

/**
 * Returns human-readable status label.
 */
function getStatusLabel(status: Ride['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Formats ISO timestamp to compact date display.
 */
function formatCompactDate(isoString: string | null): string {
  if (!isoString) return 'ASAP';

  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideDate = new Date(date);
  rideDate.setHours(0, 0, 0, 0);

  // Time formatting
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (rideDate.getTime() === today.getTime()) {
    return `Today, ${time}`;
  }
  if (rideDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${time}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${dateStr}, ${time}`;
}

export function RideListItem({ ride, onPress, className = '' }: RideListItemProps) {
  const statusColors = getStatusColor(ride.status);
  const statusLabel = getStatusLabel(ride.status);
  const displayDateTime = formatCompactDate(ride.scheduled_pickup_time);

  const accessibilityLabel = `Ride to ${ride.dropoff_address} on ${displayDateTime}. Status: ${statusLabel}. Tap to view details.`;

  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[80px] rounded-xl bg-white p-4 shadow-sm active:bg-gray-50 ${className}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Opens ride details">
      <View className="flex-row items-center justify-between">
        {/* Left side: destination and date */}
        <View className="flex-1 pr-3">
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {ride.dropoff_address}
          </Text>
          <View className="mt-1 flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">{displayDateTime}</Text>
          </View>
        </View>

        {/* Right side: status badge and chevron */}
        <View className="flex-row items-center">
          <View className={`rounded-full px-2 py-1 ${statusColors.bg}`}>
            <Text className={`text-xs font-medium ${statusColors.text}`}>{statusLabel}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" className="ml-2" />
        </View>
      </View>
    </Pressable>
  );
}
