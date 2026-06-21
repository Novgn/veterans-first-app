/**
 * RideCard Component
 *
 * Enhanced ride card displaying:
 * - StatusTimeline visualization
 * - Date and time
 * - Pickup and destination addresses
 * - Driver info when assigned (photo, name, vehicle, ride count)
 *
 * Features:
 * - 16px border radius, soft shadow
 * - Full card tappable with large touch target
 * - NativeWind styling only
 * - Full accessibility support
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, Image } from 'react-native';

import type { Ride } from '@/hooks/useRide';

import { StatusTimeline, type RideStatus } from './StatusTimeline';

/**
 * Driver information included with ride data
 */
export interface DriverInfo {
  id: string;
  firstName: string;
  profilePhotoUrl: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
}

/**
 * Extended Ride type with optional driver info
 */
export interface RideWithDriver extends Ride {
  driver?: DriverInfo;
  driverRideCount?: number;
}

interface RideCardProps {
  /** Ride data with optional driver info */
  ride: RideWithDriver;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Formats ISO timestamp to user-friendly date.
 * Returns "Today", "Tomorrow", or "Mon, Dec 15" format.
 */
function formatDate(isoString: string | null): string {
  if (!isoString) return 'ASAP';

  const date = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const rideDate = new Date(date);
  rideDate.setHours(0, 0, 0, 0);

  if (rideDate.getTime() === today.getTime()) return 'Today';
  if (rideDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats ISO timestamp to user-friendly time.
 * Returns "10:30 AM" format or "ASAP" if no time.
 */
function formatTime(isoString: string | null): string {
  if (!isoString) return 'ASAP';

  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * RideCard displays an enhanced ride card with status timeline and driver info.
 *
 * Used in the My Rides screen to show upcoming and past rides.
 * Shows StatusTimeline for active rides, hides it for completed/cancelled.
 *
 * @example
 * ```tsx
 * <RideCard
 *   ride={ride}
 *   onPress={() => router.push(`/rides/${ride.id}`)}
 *   className="mb-4"
 * />
 * ```
 */
export function RideCard({ ride, onPress, className = '' }: RideCardProps) {
  const displayDate = formatDate(ride.scheduled_pickup_time);
  const displayTime = formatTime(ride.scheduled_pickup_time);
  const hasDriver = !!ride.driver;

  const accessibilityLabel = `Ride to ${ride.dropoff_address} on ${displayDate} at ${displayTime}. ${
    hasDriver ? `Driver: ${ride.driver!.firstName}` : 'No driver assigned yet'
  }. Tap to view details.`;

  return (
    <Pressable
      testID="ride-card"
      onPress={onPress}
      className={`border-hairline rounded-lg border bg-card p-6 shadow-card active:bg-background ${className}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Opens ride details">
      {/* Status Timeline - only for active statuses */}
      <StatusTimeline currentStatus={ride.status as RideStatus} className="mb-4" />

      {/* Date and Time */}
      <View className="mb-3 flex-row items-center">
        <Ionicons name="calendar-outline" size={18} color="#1F3A5F" />
        <Text className="ml-2 font-sans-semibold text-headline text-foreground">
          {displayDate} at {displayTime}
        </Text>
      </View>

      {/* Route visualization */}
      <View className="mb-3 flex-row">
        {/* Route line indicator — sage pickup, navy dropoff, hairline connector */}
        <View className="mr-3 items-center">
          <View className="h-2.5 w-2.5 rounded-full bg-secondary" />
          <View className="h-8 w-0.5 bg-border-hairline" />
          <View className="h-2.5 w-2.5 rounded-full bg-primary" />
        </View>

        {/* Addresses */}
        <View className="flex-1">
          <Text className="font-sans text-caption text-ink-secondary">Pickup</Text>
          <Text className="font-sans-medium text-base text-foreground" numberOfLines={1}>
            {ride.pickup_address}
          </Text>
          <View className="h-2" />
          <Text className="font-sans text-caption text-ink-secondary">Destination</Text>
          <Text className="font-sans-medium text-base text-foreground" numberOfLines={1}>
            {ride.dropoff_address}
          </Text>
        </View>
      </View>

      {/* Driver Info (if assigned) */}
      {hasDriver && (
        <View className="mt-2 flex-row items-center rounded-md bg-background p-3">
          {/* Driver Photo */}
          {ride.driver!.profilePhotoUrl ? (
            <Image
              source={{ uri: ride.driver!.profilePhotoUrl }}
              className="h-12 w-12 rounded-full"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="person" size={24} color="#1F3A5F" />
            </View>
          )}

          {/* Driver Details */}
          <View className="ml-3 flex-1">
            <Text className="font-sans-semibold text-base text-foreground">
              {ride.driver!.firstName}
            </Text>
            <Text className="font-sans text-caption text-ink-secondary">
              {ride.driver!.vehicleColor} {ride.driver!.vehicleMake} {ride.driver!.vehicleModel}
            </Text>
            {ride.driverRideCount !== undefined && ride.driverRideCount > 0 && (
              <Text className="font-sans-medium text-caption text-primary">
                Driven you {ride.driverRideCount} {ride.driverRideCount === 1 ? 'time' : 'times'}
              </Text>
            )}
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={20} color="#6E685E" />
        </View>
      )}
    </Pressable>
  );
}
