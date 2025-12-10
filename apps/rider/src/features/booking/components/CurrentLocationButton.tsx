/**
 * CurrentLocationButton component for booking flow.
 *
 * Allows users to use their current GPS location as pickup.
 * Requests location permission and reverse geocodes to get address.
 *
 * Design requirements:
 * - 56dp minimum height for tap target
 * - Clear loading state
 * - Helpful error messages
 */

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';

interface LocationResult {
  lat: number;
  lng: number;
  address: string;
}

interface CurrentLocationButtonProps {
  onSelect: (location: LocationResult) => void;
}

export function CurrentLocationButton({ onSelect }: CurrentLocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    setIsLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location access to use your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Set timeout for GPS - seniors shouldn't wait forever if signal is weak
      const GPS_TIMEOUT_MS = 15000; // 15 seconds max wait

      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('GPS timeout')), GPS_TIMEOUT_MS);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      // Reverse geocode to get address
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = [
        geocode?.streetNumber,
        geocode?.street,
        geocode?.city,
        geocode?.region,
        geocode?.postalCode,
      ]
        .filter(Boolean)
        .join(' ');

      onSelect({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address: address || 'Current Location',
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select a saved place.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isLoading}
      className="min-h-[56px] flex-row items-center rounded-xl bg-blue-50 p-4 active:bg-blue-100"
      accessibilityLabel="Use current location as destination"
      accessibilityRole="button"
      accessibilityHint="Sets your current GPS location as where you want to go"
      accessibilityState={{ disabled: isLoading }}>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Ionicons name="navigate" size={24} color="white" />
        )}
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-lg font-semibold text-primary">
          {isLoading ? 'Getting Location...' : 'Use Current Location'}
        </Text>
        <Text className="text-base text-gray-600">Use my GPS location as destination</Text>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#1E40AF" />
    </Pressable>
  );
}
