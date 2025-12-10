/**
 * SavedPlaces screen - List of user's saved destinations.
 *
 * AC#1: Given a rider is on the Profile screen, When they navigate to "Saved Places",
 *       Then they see a list of their saved destinations
 * AC#5: All touch targets are 48dp+ and follow UX Design accessibility requirements
 */

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  DestinationCard,
  useDestinations,
  useDeleteDestination,
  type SavedDestination,
} from '../../src/features/profile';
import { useBookingStore } from '../../src/stores/bookingStore';

export default function SavedPlaces() {
  const { data: destinations, isLoading, error, refetch } = useDestinations();
  const deleteDestination = useDeleteDestination();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loadSavedDestinations = useBookingStore((state) => state.loadSavedDestinations);

  // Sync destinations with bookingStore for use in booking wizard (Story 2.3+)
  useEffect(() => {
    if (destinations && destinations.length > 0) {
      loadSavedDestinations(destinations);
    }
  }, [destinations, loadSavedDestinations]);

  const handleDelete = (destination: SavedDestination) => {
    Alert.alert('Delete Place', `Are you sure you want to delete "${destination.label}"?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(destination.id);
          try {
            await deleteDestination.mutateAsync(destination.id);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="mt-4 text-lg text-gray-600">Loading saved places...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="mt-4 text-center text-lg text-gray-800">
            Unable to load saved places
          </Text>
          <Text className="mt-2 text-center text-base text-gray-600">
            Please check your connection and try again
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-6 h-[56px] w-full items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Retry loading saved places"
            accessibilityRole="button">
            <Text className="text-lg font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hasDestinations = destinations && destinations.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-4">
        {hasDestinations ? (
          <>
            {destinations.map((destination) => (
              <View key={destination.id}>
                {deletingId === destination.id ? (
                  <View className="mb-3 min-h-[56px] items-center justify-center rounded-xl bg-gray-100 p-4">
                    <ActivityIndicator size="small" color="#6B7280" />
                    <Text className="mt-2 text-sm text-gray-500">Deleting...</Text>
                  </View>
                ) : (
                  <Link
                    href={{
                      pathname: '/profile/edit-place',
                      params: { id: destination.id },
                    }}
                    asChild>
                    <Pressable
                      accessibilityLabel={`Edit ${destination.label}`}
                      accessibilityRole="button"
                      disabled={deletingId !== null}
                      accessibilityState={{ disabled: deletingId !== null }}>
                      <DestinationCard
                        destination={destination}
                        onEdit={() => {}}
                        onDelete={() => handleDelete(destination)}
                      />
                    </Pressable>
                  </Link>
                )}
              </View>
            ))}
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="location-outline" size={48} color="#1E40AF" />
            </View>
            <Text className="mb-2 text-center text-xl font-semibold text-gray-800">
              No saved places yet
            </Text>
            <Text className="mb-8 text-center text-base text-gray-600">
              Add your frequently used destinations for quick booking
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button - 56dp height, primary action */}
      <View className="px-6 pb-6">
        <Link href="/profile/add-place" asChild>
          <Pressable
            className="h-[56px] flex-row items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Add a new place"
            accessibilityRole="button"
            accessibilityHint="Opens form to add a new saved destination">
            <Ionicons name="add" size={24} color="white" />
            <Text className="ml-2 text-lg font-semibold text-white">Add Place</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
