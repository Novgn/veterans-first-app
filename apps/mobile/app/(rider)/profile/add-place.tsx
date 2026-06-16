/**
 * AddPlace screen - Add new saved destination with Google Places Autocomplete.
 *
 * AC#2: Given a rider wants to add a new destination, When they tap "Add Place", Then they can:
 *       - Search for an address using Google Places Autocomplete
 *       - Enter a custom label (e.g., "Home", "Dr. Wilson", "Harris Teeter")
 *       - Mark as default pickup or dropoff
 *       - Save the destination
 * AC#5: All touch targets are 48dp+ and follow UX Design accessibility requirements
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlaceDetail,
} from 'react-native-google-places-autocomplete';

import { Button } from '@/components/ui';
import { useCreateDestination } from '@/hooks/useDestinations';

export default function AddPlace() {
  const createDestination = useCreateDestination();

  const [label, setLabel] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<{
    address: string;
    lat: number;
    lng: number;
    place_id: string;
  } | null>(null);
  const [isDefaultPickup, setIsDefaultPickup] = useState(false);
  const [isDefaultDropoff, setIsDefaultDropoff] = useState(false);

  const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

  const handlePlaceSelect = (_data: { description: string }, details: GooglePlaceDetail | null) => {
    if (!details) {
      Alert.alert('Selection Error', 'Could not get place details. Please try again.');
      return;
    }

    // Validate required fields from Google Places API
    if (!details.geometry?.location?.lat || !details.geometry?.location?.lng) {
      Alert.alert(
        'Location Error',
        'Could not determine location coordinates. Please select a different address.'
      );
      return;
    }

    setSelectedPlace({
      address: details.formatted_address || _data.description,
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      place_id: details.place_id,
    });
  };

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('Missing Label', 'Please enter a name for this place.');
      return;
    }

    if (!selectedPlace) {
      Alert.alert('Missing Address', 'Please search and select an address.');
      return;
    }

    try {
      await createDestination.mutateAsync({
        label: label.trim(),
        address: selectedPlace.address,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
        place_id: selectedPlace.place_id,
        is_default_pickup: isDefaultPickup,
        is_default_dropoff: isDefaultDropoff,
      });

      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save place. Please try again.');
    }
  };

  const canSave = label.trim() && selectedPlace && !createDestination.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          className="flex-1 px-6 pt-4"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}>
          {/* Label Input */}
          <View className="mb-6">
            <Text className="mb-2 font-sans-medium text-body text-foreground">Name this place</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="e.g., Home, Dr. Wilson, Harris Teeter"
              placeholderTextColor="#4F4A41"
              className="border-strong h-[56px] rounded-sm border bg-card px-4 font-sans text-body text-foreground"
              accessibilityLabel="Place name"
              accessibilityHint="Enter a custom label for this destination"
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Address Search */}
          <View className="mb-6">
            <Text className="mb-2 font-sans-medium text-body text-foreground">Address</Text>
            {googlePlacesApiKey ? (
              <GooglePlacesAutocomplete
                placeholder="Search for an address"
                fetchDetails={true}
                onPress={handlePlaceSelect}
                onFail={(error) => {
                  console.error('Google Places API error:', error);
                  Alert.alert(
                    'Search Error',
                    'Unable to search for addresses. Please check your connection and try again.'
                  );
                }}
                onNotFound={() => {
                  Alert.alert('No Results', 'No addresses found. Try a different search term.');
                }}
                query={{
                  key: googlePlacesApiKey,
                  language: 'en',
                  components: 'country:us',
                }}
                styles={{
                  container: {
                    flex: 0,
                  },
                  textInputContainer: {
                    backgroundColor: 'transparent',
                  },
                  textInput: {
                    height: 56,
                    fontSize: 18,
                    borderWidth: 1,
                    borderColor: '#6E685E',
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    backgroundColor: '#FFFFFF',
                    color: '#1A1813',
                  },
                  listView: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    marginTop: 4,
                    shadowColor: '#1A1813',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                    elevation: 3,
                  },
                  row: {
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    minHeight: 56,
                  },
                  description: {
                    fontSize: 16,
                    color: '#1A1813',
                  },
                  poweredContainer: {
                    display: 'none',
                  },
                }}
                enablePoweredByContainer={false}
                textInputProps={{
                  accessibilityLabel: 'Search address',
                  accessibilityHint: 'Type to search for an address',
                }}
              />
            ) : (
              <View className="rounded-lg border border-warning bg-warning-100 p-4">
                <Text className="text-center font-sans text-body text-foreground">
                  Google Places API key not configured.
                  {'\n'}Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
                </Text>
              </View>
            )}
          </View>

          {/* Selected Address Display */}
          {selectedPlace && (
            <View className="mb-6 rounded-lg bg-primary-100 p-4">
              <View className="flex-row items-start">
                <Ionicons name="location" size={24} color="#1F3A5F" />
                <View className="ml-3 flex-1">
                  <Text className="font-sans-medium text-body text-foreground">
                    Selected Address
                  </Text>
                  <Text className="mt-1 font-sans text-body text-ink-secondary">
                    {selectedPlace.address}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Default Pickup Toggle */}
          <View className="border-hairline mb-4 flex-row items-center justify-between rounded-lg border bg-card p-4 shadow-card">
            <View className="flex-1 pr-4">
              <Text className="font-sans-medium text-headline text-foreground">Default Pickup</Text>
              <Text className="font-sans text-footnote text-ink-secondary">
                Use as your default pickup location
              </Text>
            </View>
            <Switch
              value={isDefaultPickup}
              onValueChange={(value) => {
                setIsDefaultPickup(value);
                if (value) setIsDefaultDropoff(false);
              }}
              trackColor={{ false: '#DAD3C6', true: '#1F3A5F' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Set as default pickup"
              accessibilityRole="switch"
            />
          </View>

          {/* Default Dropoff Toggle */}
          <View className="border-hairline mb-6 flex-row items-center justify-between rounded-lg border bg-card p-4 shadow-card">
            <View className="flex-1 pr-4">
              <Text className="font-sans-medium text-headline text-foreground">
                Default Dropoff
              </Text>
              <Text className="font-sans text-footnote text-ink-secondary">
                Use as your default destination
              </Text>
            </View>
            <Switch
              value={isDefaultDropoff}
              onValueChange={(value) => {
                setIsDefaultDropoff(value);
                if (value) setIsDefaultPickup(false);
              }}
              trackColor={{ false: '#DAD3C6', true: '#1F3A5F' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Set as default dropoff"
              accessibilityRole="switch"
            />
          </View>

          <View className="flex-1" />
        </ScrollView>

        {/* Save Button - Fixed at bottom */}
        <View className="px-6 pb-6">
          <Button
            label={createDestination.isPending ? 'Saving...' : 'Save Place'}
            onPress={handleSave}
            disabled={!canSave}
            loading={createDestination.isPending}
            leftIcon={<Ionicons name="checkmark" size={24} color="white" />}
            accessibilityLabel="Save place"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
