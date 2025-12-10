/**
 * AddressSearchInput component for booking flow.
 *
 * Uses Google Places Autocomplete for address search.
 * Allows users to search for destinations not in their saved places.
 *
 * Design requirements:
 * - 56dp input height for senior-friendly touch target
 * - 18px font size for readability
 * - Clear error handling
 */

import { useState } from 'react';
import { View, Text } from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlaceDetail,
} from 'react-native-google-places-autocomplete';

import { GOOGLE_PLACES_API_KEY } from '../../../lib/constants';
import type { Destination } from '../../../stores/bookingStore';

interface AddressSearchInputProps {
  onSelect: (destination: Destination) => void;
}

export function AddressSearchInput({ onSelect }: AddressSearchInputProps) {
  const [searchError, setSearchError] = useState<string | null>(null);
  const handlePlaceSelect = (_data: unknown, details: GooglePlaceDetail | null) => {
    // Defensive checks for required data
    if (!details) {
      console.warn('AddressSearchInput: No place details received');
      return;
    }

    // Validate geometry exists (required for location)
    if (!details.geometry?.location) {
      console.warn('AddressSearchInput: Place missing geometry data', details.place_id);
      return;
    }

    const { lat, lng } = details.geometry.location;

    // Validate coordinates are valid numbers
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.warn('AddressSearchInput: Invalid coordinates', { lat, lng });
      return;
    }

    // Generate unique ID using crypto.randomUUID (available in React Native)
    const uniqueId = `search-${crypto.randomUUID()}`;

    onSelect({
      id: uniqueId,
      name: details.name || details.formatted_address?.split(',')[0] || 'Selected Location',
      address: details.formatted_address || 'Unknown address',
      latitude: lat,
      longitude: lng,
      placeId: details.place_id,
    });
  };

  const handleSearchFail = (error: string) => {
    console.warn('Google Places error:', error);
    setSearchError('Unable to search. Please check your connection and try again.');
  };

  const handleNotFound = () => {
    console.warn('Google Places: No results found');
    setSearchError('No addresses found. Try a different search.');
  };

  const handleTextChange = () => {
    // Clear error when user starts typing again
    if (searchError) {
      setSearchError(null);
    }
  };

  return (
    <View className="mt-4 border-t border-gray-200 pt-4">
      <Text className="mb-3 text-lg font-semibold text-gray-700">Or search for an address</Text>

      {searchError && (
        <View
          className="mb-3 rounded-lg bg-red-50 p-3"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite">
          <Text className="text-base text-red-700">{searchError}</Text>
        </View>
      )}

      <GooglePlacesAutocomplete
        placeholder="Enter destination address"
        fetchDetails={true}
        onPress={handlePlaceSelect}
        onFail={handleSearchFail}
        onNotFound={handleNotFound}
        textInputProps={{
          accessibilityLabel: 'Search for an address',
          accessibilityHint: 'Type to search for a destination address',
          onChangeText: handleTextChange,
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en',
          components: 'country:us',
        }}
        styles={{
          container: {
            flex: 0,
          },
          textInput: {
            height: 56,
            fontSize: 18,
            backgroundColor: '#FAFAFA',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            paddingHorizontal: 16,
          },
          listView: {
            backgroundColor: 'white',
            borderRadius: 12,
            marginTop: 8,
          },
          row: {
            minHeight: 56,
            paddingVertical: 16,
          },
          description: {
            fontSize: 16,
          },
        }}
        enablePoweredByContainer={false}
        debounce={300}
      />
    </View>
  );
}
