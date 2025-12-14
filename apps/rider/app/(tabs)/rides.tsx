/**
 * My Rides Screen (Tab)
 *
 * Lists upcoming and past rides with navigation to ride details.
 * Supports pull-to-refresh for status updates and real-time subscriptions.
 *
 * Features:
 * - Shows upcoming rides with RideCard (includes StatusTimeline and driver info)
 * - Shows past rides with compact RideListItem
 * - Tap ride navigates to RideDetailScreen
 * - Real-time updates via Supabase subscriptions
 * - Pull-to-refresh for manual updates
 * - Empty state when no rides
 * - Full accessibility support
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { Header } from '../../src/components/Header';
import { useRides, RideCard, RideListItem, type RideWithDriver } from '../../src/features/rides';

/**
 * Categorizes rides into upcoming and past based on status
 */
function categorizeRides(rides: RideWithDriver[]): {
  upcoming: RideWithDriver[];
  past: RideWithDriver[];
} {
  const upcoming: RideWithDriver[] = [];
  const past: RideWithDriver[] = [];

  for (const ride of rides) {
    // Active statuses are always "upcoming"
    if (['pending', 'assigned', 'in_progress'].includes(ride.status)) {
      upcoming.push(ride);
    } else {
      // Completed and cancelled are "past"
      past.push(ride);
    }
  }

  // Sort upcoming by scheduled time (ascending - soonest first)
  upcoming.sort((a, b) => {
    const timeA = a.scheduled_pickup_time ? new Date(a.scheduled_pickup_time).getTime() : 0;
    const timeB = b.scheduled_pickup_time ? new Date(b.scheduled_pickup_time).getTime() : 0;
    return timeA - timeB;
  });

  // Sort past by updated_at (descending - most recent first)
  past.sort((a, b) => {
    const timeA = new Date(a.updated_at).getTime();
    const timeB = new Date(b.updated_at).getTime();
    return timeB - timeA;
  });

  return { upcoming, past };
}

type SectionData =
  | { type: 'header'; title: string }
  | { type: 'upcoming-ride'; ride: RideWithDriver }
  | { type: 'past-ride'; ride: RideWithDriver }
  | { type: 'empty'; message: string };

export default function RidesScreen() {
  const { data: rides, isLoading, error, refetch, isRefetching } = useRides();

  const handleRidePress = useCallback((rideId: string) => {
    router.push(`/rides/${rideId}`);
  }, []);

  // Build section data for FlatList
  const sectionData = useMemo((): SectionData[] => {
    if (!rides || rides.length === 0) {
      return [];
    }

    const { upcoming, past } = categorizeRides(rides);
    const data: SectionData[] = [];

    // Upcoming section - uses enhanced RideCard with StatusTimeline
    if (upcoming.length > 0) {
      data.push({ type: 'header', title: 'Upcoming Rides' });
      upcoming.forEach((ride) => data.push({ type: 'upcoming-ride', ride }));
    }

    // Past section - uses compact RideListItem
    if (past.length > 0) {
      data.push({ type: 'header', title: 'Past Rides' });
      past.forEach((ride) => data.push({ type: 'past-ride', ride }));
    }

    return data;
  }, [rides]);

  const renderItem = useCallback(
    ({ item }: { item: SectionData }) => {
      if (item.type === 'header') {
        return (
          <View className="mb-2 mt-6">
            <Text className="text-lg font-semibold text-gray-700">{item.title}</Text>
          </View>
        );
      }

      // Upcoming rides use enhanced RideCard with StatusTimeline and driver info
      if (item.type === 'upcoming-ride') {
        return (
          <RideCard
            ride={item.ride}
            onPress={() => handleRidePress(item.ride.id)}
            className="mb-4"
          />
        );
      }

      // Past rides use compact RideListItem
      if (item.type === 'past-ride') {
        return (
          <RideListItem
            ride={item.ride}
            onPress={() => handleRidePress(item.ride.id)}
            className="mb-2"
          />
        );
      }

      if (item.type === 'empty') {
        return (
          <View className="flex-1 items-center justify-center rounded-xl bg-gray-100 p-8">
            <Ionicons name="car-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-center text-lg font-medium text-gray-700">
              {item.message}
            </Text>
          </View>
        );
      }

      return null;
    },
    [handleRidePress]
  );

  const keyExtractor = useCallback((item: SectionData, index: number) => {
    if (item.type === 'header') {
      return `header-${item.title}`;
    }
    if (item.type === 'upcoming-ride' || item.type === 'past-ride') {
      return item.ride.id;
    }
    return `item-${index}`;
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Header title="My Rides" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="mt-4 text-lg text-gray-600">Loading your rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Header title="My Rides" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="alert-circle" size={40} color="#DC2626" />
          </View>
          <Text className="mt-4 text-xl font-bold text-foreground">Unable to Load Rides</Text>
          <Text className="mt-2 text-center text-lg text-gray-600">
            We couldn&apos;t load your rides. Pull down to try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!rides || rides.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Header title="My Rides" />
        <View className="flex-1 px-6 pt-4">
          <Text className="mb-6 text-2xl font-bold text-foreground" accessibilityRole="header">
            My Rides
          </Text>

          <View className="flex-1 items-center justify-center rounded-xl bg-gray-100 p-8">
            <Ionicons name="car-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-center text-lg font-medium text-gray-700">No rides yet</Text>
            <Text className="mt-2 text-center text-gray-500">
              Your upcoming and past rides will appear here
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="My Rides" />
      <View className="flex-1 px-6">
        <Text className="mt-4 text-2xl font-bold text-foreground" accessibilityRole="header">
          My Rides
        </Text>

        <FlatList
          data={sectionData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#1E40AF']}
              tintColor="#1E40AF"
            />
          }
          ListFooterComponent={<View className="h-4" />}
        />
      </View>
    </SafeAreaView>
  );
}
