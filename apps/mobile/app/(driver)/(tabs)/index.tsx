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

import { StatusToggle, TripCard, EmptyTripQueue, TripQueueSkeleton } from '@/components/trips';
import { useDriverTrips } from '@/hooks';
import { useTripStore } from '@/stores/tripStore';

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
          <Text className="font-sans-bold text-title-1 text-foreground">
            {getGreeting()}, {user?.firstName || 'Driver'}
          </Text>
          <Text className="font-sans text-body text-ink-secondary">
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
          <Text className="mb-3 font-sans-semibold text-title-3 text-foreground">Your Trips</Text>

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
          <View className="border-hairline flex-1 items-center rounded-lg border bg-card p-4 shadow-card">
            <Text className="font-sans-bold text-title-1 text-primary">{tripCount}</Text>
            <Text className="font-sans text-caption text-ink-secondary">Assigned</Text>
          </View>
          <View className="border-hairline flex-1 items-center rounded-lg border bg-card p-4 shadow-card">
            <Text className="font-sans-bold text-title-1 text-success">$0</Text>
            <Text className="font-sans text-caption text-ink-secondary">Today&apos;s Earnings</Text>
          </View>
        </View>

        {/* Status Info — calm informational banners; icon + text, never color alone */}
        {status === 'available' && (
          <View className="border-hairline mb-6 flex-row items-center rounded-lg border bg-secondary-100 p-4">
            <Ionicons name="checkmark-circle" size={24} color="#4A6B54" />
            <Text className="ml-3 flex-1 font-sans text-body text-foreground">
              You&apos;re available for trips. New ride requests will appear in your queue.
            </Text>
          </View>
        )}

        {status === 'offline' && (
          <View className="border-hairline mb-6 flex-row items-center rounded-lg border bg-background p-4">
            <Ionicons name="moon" size={24} color="#4F4A41" />
            <Text className="ml-3 flex-1 font-sans text-body text-ink-secondary">
              You&apos;re offline. Set your status to Available to receive trip requests.
            </Text>
          </View>
        )}

        {status === 'on_trip' && (
          <View className="border-hairline mb-6 flex-row items-center rounded-lg border bg-primary-100 p-4">
            <Ionicons name="car" size={24} color="#1F3A5F" />
            <Text className="ml-3 flex-1 font-sans text-body text-foreground">
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
