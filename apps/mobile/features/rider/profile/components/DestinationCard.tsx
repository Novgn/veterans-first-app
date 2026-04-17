/**
 * DestinationCard component for displaying saved destinations.
 *
 * Follows UX Design requirements:
 * - 56dp height for primary tap targets
 * - 48dp+ touch targets for all interactive elements
 * - Warm & Minimal design direction
 * - Senior-friendly typography
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { SavedDestination } from '../hooks/useDestinations';

interface DestinationCardProps {
  destination: SavedDestination;
  onEdit: (destination: SavedDestination) => void;
  onDelete: (destination: SavedDestination) => void;
}

export function DestinationCard({ destination, onEdit, onDelete }: DestinationCardProps) {
  return (
    <View className="mb-3 min-h-[56px] rounded-xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          {/* Label with icon and badges */}
          <View className="flex-row flex-wrap items-center">
            <Ionicons name="location" size={24} color="#1E40AF" />
            <Text className="ml-2 text-lg font-semibold text-foreground" accessibilityRole="text">
              {destination.label}
            </Text>
            {destination.is_default_pickup && (
              <View className="ml-2 rounded-full bg-blue-100 px-2 py-0.5">
                <Text className="text-xs font-medium text-blue-800">Pickup</Text>
              </View>
            )}
            {destination.is_default_dropoff && (
              <View className="ml-2 rounded-full bg-green-100 px-2 py-0.5">
                <Text className="text-xs font-medium text-green-800">Dropoff</Text>
              </View>
            )}
          </View>

          {/* Address preview */}
          <Text className="mt-1 text-base text-gray-600" numberOfLines={1} accessibilityRole="text">
            {destination.address}
          </Text>
        </View>

        {/* Edit/Delete Actions - 48dp+ touch targets */}
        <View className="flex-row">
          <Pressable
            onPress={() => onEdit(destination)}
            className="h-12 w-12 items-center justify-center rounded-full"
            accessibilityLabel={`Edit ${destination.label}`}
            accessibilityRole="button"
            accessibilityHint="Opens editor for this saved place">
            <Ionicons name="pencil" size={20} color="#6B7280" />
          </Pressable>
          <Pressable
            onPress={() => onDelete(destination)}
            className="h-12 w-12 items-center justify-center rounded-full"
            accessibilityLabel={`Delete ${destination.label}`}
            accessibilityRole="button"
            accessibilityHint="Removes this saved place">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
