/**
 * Trip Detail Screen
 *
 * Displays full trip details including:
 * - RiderProfileCard with full rider info
 * - Pickup and dropoff addresses with map preview
 * - Navigation button (placeholder for Story 3.5)
 */

import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, SafeAreaView, Pressable, ScrollView, ActivityIndicator } from 'react-native';

import { RiderProfileCard } from '@/components/trips';
import { useTrip, useRiderHistory } from '@/hooks';

/**
 * Formats pickup time with smart date labels
 */
function formatPickupTime(dateString: string): string {
  const date = new Date(dateString);
  const time = format(date, 'h:mm a');

  if (isToday(date)) return `Today at ${time}`;
  if (isTomorrow(date)) return `Tomorrow at ${time}`;
  return format(date, 'EEEE, MMMM d') + ` at ${time}`;
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: trip, isLoading, error } = useTrip(id ?? '');
  const { data: relationshipCount = 0 } = useRiderHistory(trip?.rider?.id ?? '');

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center border-b border-gray-200 px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 min-h-[48px] min-w-[48px] items-center justify-center"
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </Pressable>
          <Text className="text-xl font-bold text-foreground">Trip Details</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="mt-4 text-gray-600">Loading trip details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !trip) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-row items-center border-b border-gray-200 px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 min-h-[48px] min-w-[48px] items-center justify-center"
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </Pressable>
          <Text className="text-xl font-bold text-foreground">Trip Details</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="alert-circle" size={32} color="#DC2626" />
          </View>
          <Text className="text-lg font-semibold text-foreground">Trip not found</Text>
          <Text className="mt-2 text-center text-gray-600">
            This trip may have been cancelled or doesn&apos;t exist.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-8 min-h-[48px] flex-row items-center justify-center rounded-xl bg-primary px-8"
            accessibilityLabel="Return to home"
            accessibilityRole="button">
            <Ionicons name="home" size={20} color="white" />
            <Text className="ml-2 font-semibold text-white">Return Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 min-h-[48px] min-w-[48px] items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#1E40AF" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">Trip Details</Text>
          <Text className="text-sm text-gray-600">
            {formatPickupTime(trip.scheduledPickupTime)}
          </Text>
        </View>
        <View className="rounded-full bg-blue-100 px-3 py-1">
          <Text className="text-xs font-semibold text-blue-700">
            {trip.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Rider Profile Card */}
        <RiderProfileCard
          rider={trip.rider}
          preferences={trip.riderPreferences}
          relationshipCount={relationshipCount}
          testID="rider-profile-card"
        />

        {/* Addresses Section */}
        <View className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <Text className="mb-3 text-lg font-semibold text-foreground">Trip Route</Text>

          {/* Pickup Address */}
          <View className="mb-4">
            <View className="flex-row items-start">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="location" size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase text-gray-500">Pickup</Text>
                <Text className="mt-1 text-base text-foreground">{trip.pickupAddress}</Text>
              </View>
            </View>
          </View>

          {/* Route line */}
          <View className="ml-4 h-6 border-l-2 border-dashed border-gray-300" />

          {/* Dropoff Address */}
          <View className="mt-2">
            <View className="flex-row items-start">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="flag" size={18} color="#DC2626" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase text-gray-500">Dropoff</Text>
                <Text className="mt-1 text-base text-foreground">{trip.dropoffAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Button - Placeholder for Story 3.5 */}
        <View className="mt-4">
          <Pressable
            className="min-h-[56px] flex-row items-center justify-center rounded-xl bg-blue-600"
            accessibilityLabel="Start navigation to pickup"
            accessibilityRole="button"
            accessibilityHint="Navigation coming in Story 3.5"
            disabled
            style={{ opacity: 0.6 }}>
            <Ionicons name="navigate" size={24} color="white" />
            <Text className="ml-2 text-lg font-semibold text-white">Start Navigation</Text>
          </Pressable>
          <Text className="mt-2 text-center text-xs text-gray-500">
            Navigation integration coming in Story 3.5
          </Text>
        </View>

        {/* Spacer for bottom */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
