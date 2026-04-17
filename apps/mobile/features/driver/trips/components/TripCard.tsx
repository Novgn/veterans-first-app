/**
 * TripCard component
 *
 * Displays a trip summary card for the driver's queue showing:
 * - Pickup time (with smart formatting)
 * - Rider name and photo
 * - Pickup and dropoff addresses
 * - Accessibility need icons
 * - Special instructions preview
 */

import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow } from 'date-fns';
import { Link } from 'expo-router';
import { View, Text, Pressable, Image } from 'react-native';

import type { DriverTrip } from '../hooks/useDriverTrips';

import { AccessibilityBadges } from './AccessibilityBadges';

interface TripCardProps {
  trip: DriverTrip;
  testID?: string;
}

/**
 * Formats pickup time with smart date labels
 * - Today: "Today 2:30 PM"
 * - Tomorrow: "Tomorrow 2:30 PM"
 * - Other: "Mon, Jan 15 2:30 PM"
 */
function formatPickupTime(dateString: string): string {
  const date = new Date(dateString);
  const time = format(date, 'h:mm a');

  if (isToday(date)) return `Today ${time}`;
  if (isTomorrow(date)) return `Tomorrow ${time}`;
  return `${format(date, 'EEE, MMM d')} ${time}`;
}

/**
 * Gets initials from first and last name
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function TripCard({ trip, testID }: TripCardProps) {
  const riderName = `${trip.rider.firstName} ${trip.rider.lastName}`;
  const initials = getInitials(trip.rider.firstName, trip.rider.lastName);
  const formattedTime = formatPickupTime(trip.scheduledPickupTime);

  // Get special notes (equipment notes or other notes)
  const specialNotes = trip.riderPreferences?.specialEquipmentNotes;
  const truncatedNotes = specialNotes
    ? specialNotes.length > 50
      ? `${specialNotes.substring(0, 50)}...`
      : specialNotes
    : null;

  return (
    <Link href={`/trips/${trip.id}`} asChild>
      <Pressable
        className="mb-3 rounded-xl bg-white p-4 shadow-sm"
        accessibilityLabel={`Trip with ${riderName} at ${formattedTime}`}
        accessibilityRole="button"
        accessibilityHint="Tap to view trip details"
        testID={testID}
        style={{ minHeight: 48 }}>
        {/* Header: Time + Status */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-primary">{formattedTime}</Text>
          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-xs font-semibold text-blue-700">
              {trip.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Rider Info */}
        <View className="mb-3 flex-row items-center">
          {trip.rider.profilePhotoUrl ? (
            <Image
              source={{ uri: trip.rider.profilePhotoUrl }}
              className="h-12 w-12 rounded-full"
              accessibilityLabel={`Photo of ${riderName}`}
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <Text className="text-lg font-bold text-gray-600">{initials}</Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-foreground">{riderName}</Text>
            {trip.riderPreferences && (
              <AccessibilityBadges preferences={trip.riderPreferences} size="sm" />
            )}
          </View>
        </View>

        {/* Addresses */}
        <View className="mb-2">
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#059669" />
            <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
              {trip.pickupAddress}
            </Text>
          </View>
          <View className="ml-2 h-4 border-l border-dashed border-gray-300" />
          <View className="flex-row items-center">
            <Ionicons name="flag" size={16} color="#DC2626" />
            <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
              {trip.dropoffAddress}
            </Text>
          </View>
        </View>

        {/* Special Instructions Preview */}
        {truncatedNotes && (
          <View className="mt-2 rounded-lg bg-amber-50 px-3 py-2">
            <Text className="text-sm text-amber-800" numberOfLines={1}>
              <Ionicons name="information-circle" size={14} color="#B45309" /> {truncatedNotes}
            </Text>
          </View>
        )}

        {/* Chevron indicator */}
        <View className="absolute right-4 top-1/2" style={{ transform: [{ translateY: -10 }] }}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </Pressable>
    </Link>
  );
}
