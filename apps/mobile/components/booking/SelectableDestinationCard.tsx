/**
 * SelectableDestinationCard component for booking flow.
 *
 * A tappable card that displays a saved destination.
 * Used in the DestinationPicker for Step 1 of booking.
 *
 * Design requirements:
 * - 56dp minimum height for primary tap targets
 * - Clear visual hierarchy with label, address, and badges
 * - Senior-friendly sizing and contrast
 * - Full card is tappable
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { Destination } from '@/stores/bookingStore';

interface SelectableDestinationCardProps {
  destination: Destination;
  onSelect: () => void;
}

export function SelectableDestinationCard({
  destination,
  onSelect,
}: SelectableDestinationCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      className="mb-3 min-h-[56px] flex-row items-center rounded-xl bg-white p-4 shadow-sm active:bg-gray-50"
      accessibilityLabel={`Select ${destination.name}, ${destination.address}`}
      accessibilityRole="button"
      accessibilityHint="Tap to select this destination for your ride">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Ionicons name="location" size={24} color="#1E40AF" />
      </View>

      <View className="ml-4 flex-1">
        <View className="flex-row flex-wrap items-center">
          <Text className="text-lg font-semibold text-foreground">{destination.name}</Text>
          {destination.isDefaultDropoff && (
            <View className="ml-2 rounded-full bg-green-100 px-2 py-0.5">
              <Text className="text-xs font-medium text-green-800">Default</Text>
            </View>
          )}
          {destination.isDefaultPickup && (
            <View className="ml-2 rounded-full bg-blue-100 px-2 py-0.5">
              <Text className="text-xs font-medium text-blue-800">Pickup</Text>
            </View>
          )}
        </View>
        <Text className="mt-0.5 text-base text-gray-600" numberOfLines={1}>
          {destination.address}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </Pressable>
  );
}
