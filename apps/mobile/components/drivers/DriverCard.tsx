/**
 * DriverCard Component
 *
 * Displays driver information with relationship history.
 * Used in DriverSelectionSheet and profile settings.
 *
 * UX Design Requirements:
 * - Photo, name, vehicle, relationship counter ("Driven you X times")
 * - Large touch target (full card tappable)
 * - 16px border radius, soft shadow
 * - All touch targets 48dp+ minimum
 *
 * Story 2.7: Implement Preferred Driver Selection
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

/**
 * Driver data for display
 */
export interface DriverCardDriver {
  id: string;
  firstName: string;
  profilePhotoUrl?: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
}

interface DriverCardProps {
  /** Driver data to display */
  driver: DriverCardDriver;
  /** Number of rides completed with this driver */
  rideCount: number;
  /** ISO date string of last ride */
  lastRideDate?: string | null;
  /** Whether this driver is currently selected */
  isSelected?: boolean;
  /** Handler for card press */
  onPress?: () => void;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Format date as relative time string
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * DriverCard displays a driver's photo, name, vehicle info, and relationship history.
 * The entire card is tappable with a minimum touch target of 48dp.
 */
export function DriverCard({
  driver,
  rideCount,
  lastRideDate,
  isSelected = false,
  onPress,
  testID,
}: DriverCardProps) {
  const accessibilityLabel = `${driver.firstName}, ${driver.vehicleColor} ${driver.vehicleMake} ${driver.vehicleModel}, driven you ${rideCount} ${rideCount === 1 ? 'time' : 'times'}${isSelected ? ', selected' : ''}`;

  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[80px] flex-row items-center rounded-lg p-4 ${
        isSelected ? 'border-2 border-primary bg-primary-50' : 'border-hairline border bg-card'
      } shadow-card active:bg-background`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      testID={testID}>
      {/* Driver Photo */}
      <View className="mr-4">
        {driver.profilePhotoUrl ? (
          <Image
            source={{ uri: driver.profilePhotoUrl }}
            className="h-16 w-16 rounded-full"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Ionicons name="person" size={32} color="#1F3A5F" />
          </View>
        )}
      </View>

      {/* Driver Info */}
      <View className="flex-1">
        <Text className="font-sans-bold text-xl text-foreground">{driver.firstName}</Text>
        <Text className="mt-1 font-sans text-base text-ink-secondary">
          {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
        </Text>
        <Text className="mt-1 font-sans-medium text-base text-primary">
          Driven you {rideCount} {rideCount === 1 ? 'time' : 'times'}
        </Text>
        {lastRideDate && (
          <Text className="font-sans text-caption text-ink-secondary">
            Last ride: {formatRelativeDate(lastRideDate)}
          </Text>
        )}
      </View>

      {/* Selection indicator */}
      {isSelected && (
        <View className="ml-2">
          <Ionicons name="checkmark-circle" size={28} color="#1F3A5F" />
        </View>
      )}
    </Pressable>
  );
}
