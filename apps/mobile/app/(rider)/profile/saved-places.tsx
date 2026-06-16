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

import { DestinationCard } from '@/components/profile';
import { Button } from '@/components/ui';
import { useDeleteDestination, useDestinations, type SavedDestination } from '@/hooks';
import { useBookingStore } from '@/stores/bookingStore';

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
          <ActivityIndicator size="large" color="#1F3A5F" />
          <Text className="mt-4 font-sans text-body text-ink-secondary">
            Loading saved places...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#A83A35" />
          <Text className="mt-4 text-center font-sans-semibold text-headline text-foreground">
            Unable to load saved places
          </Text>
          <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
            Please check your connection and try again
          </Text>
          <View className="mt-6 w-full">
            <Button
              label="Try Again"
              onPress={() => refetch()}
              accessibilityLabel="Retry loading saved places"
            />
          </View>
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
                  <View className="border-hairline mb-3 min-h-[56px] items-center justify-center rounded-lg border bg-card p-4">
                    <ActivityIndicator size="small" color="#4F4A41" />
                    <Text className="mt-2 font-sans text-footnote text-ink-secondary">
                      Deleting...
                    </Text>
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
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="location-outline" size={48} color="#1F3A5F" />
            </View>
            <Text className="mb-2 text-center font-sans-semibold text-title-2 text-foreground">
              No saved places yet
            </Text>
            <Text className="mb-8 text-center font-sans text-body text-ink-secondary">
              Add your frequently used destinations for quick booking
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button - 56dp height, primary action */}
      <View className="px-6 pb-6">
        <Link href="/profile/add-place" asChild>
          <Button
            label="Add Place"
            leftIcon={<Ionicons name="add" size={24} color="white" />}
            accessibilityLabel="Add a new place"
            accessibilityHint="Opens form to add a new saved destination"
          />
        </Link>
      </View>
    </SafeAreaView>
  );
}
