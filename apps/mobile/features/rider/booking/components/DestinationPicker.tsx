/**
 * DestinationPicker component for booking flow Step 1.
 *
 * Displays saved destinations as selectable cards, current location option,
 * and address search. This is the main interface for "Where are you going?"
 *
 * Design requirements:
 * - Saved destinations shown as large, tappable cards (56dp height)
 * - Default destinations highlighted and shown first
 * - Current location option at top
 * - Address search at bottom
 * - Empty state for users with no saved places
 */

import { Ionicons } from '@expo/vector-icons';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';

import type { Destination } from '../../stores/bookingStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useDestinations } from '../../profile/hooks/useDestinations';

import { AddressSearchInput } from './AddressSearchInput';
import { CurrentLocationButton } from './CurrentLocationButton';
import { SelectableDestinationCard } from './SelectableDestinationCard';

interface DestinationPickerProps {
  onSelect: (destination: Destination) => void;
  className?: string;
}

export function DestinationPicker({ onSelect, className }: DestinationPickerProps) {
  const { data: savedDestinations = [], isLoading, error } = useDestinations();
  const { savedDestinations: cachedDestinations } = useBookingStore();

  // Use cached destinations if loading, otherwise use fresh data
  const destinations: Destination[] = isLoading
    ? cachedDestinations
    : savedDestinations.map((d) => ({
        id: d.id,
        name: d.label,
        address: d.address,
        latitude: d.lat,
        longitude: d.lng,
        placeId: d.place_id ?? undefined,
        isDefaultPickup: d.is_default_pickup,
        isDefaultDropoff: d.is_default_dropoff,
      }));

  // Sort destinations by priority (AC #2: "Most frequently used first")
  // Priority order:
  // 1. Default dropoff (most likely destination - e.g., VA hospital, work)
  // 2. Default pickup (home location)
  // 3. Preserve API order (useDestinations returns created_at DESC, so newer first)
  //
  // Note: True frequency tracking requires database schema update to add usage_count field.
  // Current implementation uses defaults as proxy for "frequently used" since users
  // mark their most-used destinations as defaults. Non-default destinations maintain
  // their API order which reflects recency of creation.
  const sortedDestinations = [...destinations].sort((a, b) => {
    // Default dropoff first (highest priority - common destination like work/VA)
    if (a.isDefaultDropoff && !b.isDefaultDropoff) return -1;
    if (!a.isDefaultDropoff && b.isDefaultDropoff) return 1;
    // Default pickup second (home location)
    if (a.isDefaultPickup && !b.isDefaultPickup) return -1;
    if (!a.isDefaultPickup && b.isDefaultPickup) return 1;
    // For non-defaults, preserve original API order (already sorted by created_at DESC)
    // This keeps recently added destinations visible while defaults take priority
    return 0;
  });

  const handleCurrentLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    onSelect({
      id: 'current-location',
      name: 'Current Location',
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
    });
  };

  return (
    <View className={className}>
      {/* Current Location Option */}
      <CurrentLocationButton onSelect={handleCurrentLocationSelect} />

      {/* Saved Destinations Section */}
      <Text className="mb-3 mt-4 text-lg font-semibold text-gray-700">Saved Places</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled">
        {isLoading && cachedDestinations.length === 0 ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text className="mt-4 text-center text-gray-500">Loading saved places...</Text>
          </View>
        ) : error ? (
          <View className="items-center py-8">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="mt-4 text-center text-gray-500">Unable to load saved places</Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              Search for an address below
            </Text>
          </View>
        ) : sortedDestinations.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons name="location-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-center text-gray-500">No saved places yet</Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              Search for an address below
            </Text>
          </View>
        ) : (
          sortedDestinations.map((destination) => (
            <SelectableDestinationCard
              key={destination.id}
              destination={destination}
              onSelect={() => onSelect(destination)}
            />
          ))
        )}
      </ScrollView>

      {/* Address Search */}
      <AddressSearchInput onSelect={onSelect} />
    </View>
  );
}
