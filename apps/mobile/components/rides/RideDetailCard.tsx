/**
 * RideDetailCard Component
 *
 * Card displaying ride details with route visualization.
 * Shows pickup, destination, date, time, and status.
 *
 * Features:
 * - Visual route indicator (origin dot → line → destination dot)
 * - Status badge with color coding
 * - Date and time display
 * - Full accessibility support
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import type { Ride } from '@/hooks/useRide';

interface RideDetailCardProps {
  /** Ride data */
  ride: Ride;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Returns status badge color based on ride status.
 */
function getStatusColor(status: Ride['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'assigned':
      return 'bg-blue-500';
    case 'in_progress':
      return 'bg-green-500';
    case 'completed':
      return 'bg-gray-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
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
      return 'Driver Assigned';
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
 * Formats ISO timestamp to user-friendly date.
 */
function formatDate(isoString: string | null): string {
  if (!isoString) return 'Not scheduled';

  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideDate = new Date(date);
  rideDate.setHours(0, 0, 0, 0);

  if (rideDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (rideDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats ISO timestamp to user-friendly time.
 */
function formatTime(isoString: string | null): string {
  if (!isoString) return 'ASAP';

  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function RideDetailCard({ ride, className = '' }: RideDetailCardProps) {
  const displayDate = formatDate(ride.scheduled_pickup_time);
  const displayTime = formatTime(ride.scheduled_pickup_time);
  const statusColor = getStatusColor(ride.status);
  const statusLabel = getStatusLabel(ride.status);

  const accessibilityLabel = `Ride from ${ride.pickup_address} to ${ride.dropoff_address} on ${displayDate} at ${displayTime}. Status: ${statusLabel}`;

  return (
    <View
      className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}
      accessible={true}
      accessibilityLabel={accessibilityLabel}>
      {/* Status badge */}
      <View className="mb-4 flex-row">
        <View className={`rounded-full px-3 py-1 ${statusColor}`}>
          <Text className="text-sm font-semibold text-white">{statusLabel}</Text>
        </View>
      </View>

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
            <Text className="text-sm font-medium text-gray-500">Pickup</Text>
            <Text className="text-lg font-semibold text-foreground" numberOfLines={2}>
              {ride.pickup_address}
            </Text>
          </View>

          {/* Destination */}
          <View>
            <Text className="text-sm font-medium text-gray-500">Destination</Text>
            <Text className="text-lg font-semibold text-foreground" numberOfLines={2}>
              {ride.dropoff_address}
            </Text>
          </View>
        </View>
      </View>

      {/* Date and Time */}
      <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4">
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        <Text className="ml-2 text-lg font-medium text-foreground">{displayDate}</Text>
        <View className="mx-3 h-1 w-1 rounded-full bg-gray-400" />
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <Text className="ml-2 text-lg font-medium text-foreground">{displayTime}</Text>
      </View>
    </View>
  );
}
