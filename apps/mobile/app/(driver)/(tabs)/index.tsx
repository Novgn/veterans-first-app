/**
 * Driver Home Screen
 *
 * Main dashboard showing:
 * - Personalized greeting
 * - Driver status toggle
 * - Trip queue with assigned rides
 * - Quick stats
 */

import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl } from 'react-native';

import {
  StatusToggle,
  TripCard,
  EmptyTripQueue,
  TripQueueSkeleton,
} from '@driver/trips/components';
import { useDriverTrips } from '@driver/trips/hooks';
import { useTripStore } from '@driver/stores/tripStore';

export default function HomeScreen() {
  const { user } = useUser();
  const { status, setStatus } = useTripStore();
  const { data: trips, isLoading, refetch, isRefetching } = useDriverTrips();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const tripCount = trips?.length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 pt-4"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}>
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-foreground">
            {getGreeting()}, {user?.firstName || 'Driver'}
          </Text>
          <Text className="text-gray-600">
            {tripCount > 0
              ? `${tripCount} ride${tripCount !== 1 ? 's' : ''} assigned`
              : 'Ready to start driving?'}
          </Text>
        </View>

        {/* Status Toggle */}
        <View className="mb-6">
          <StatusToggle value={status} onChange={setStatus} testID="driver-status-toggle" />
        </View>

        {/* Trip Queue */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">Your Trips</Text>

          {isLoading ? (
            <TripQueueSkeleton count={3} testID="trip-queue-skeleton" />
          ) : trips && trips.length > 0 ? (
            trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} testID={`trip-card-${trip.id}`} />
            ))
          ) : (
            <EmptyTripQueue testID="empty-trip-queue" />
          )}
        </View>

        {/* Quick Stats */}
        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 items-center rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-primary">{tripCount}</Text>
            <Text className="text-sm text-gray-600">Assigned</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-green-600">$0</Text>
            <Text className="text-sm text-gray-600">Today&apos;s Earnings</Text>
          </View>
        </View>

        {/* Status Info */}
        {status === 'available' && (
          <View className="mb-6 flex-row items-center rounded-xl border border-green-200 bg-green-50 p-4">
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text className="ml-3 flex-1 text-green-800">
              You&apos;re available for trips. New ride requests will appear in your queue.
            </Text>
          </View>
        )}

        {status === 'offline' && (
          <View className="mb-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Ionicons name="moon" size={24} color="#6B7280" />
            <Text className="ml-3 flex-1 text-gray-700">
              You&apos;re offline. Set your status to Available to receive trip requests.
            </Text>
          </View>
        )}

        {status === 'on_trip' && (
          <View className="mb-6 flex-row items-center rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Ionicons name="car" size={24} color="#1E40AF" />
            <Text className="ml-3 flex-1 text-blue-800">
              You&apos;re on a trip. Complete your current trip to receive new requests.
            </Text>
          </View>
        )}

        {/* Bottom spacer */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
