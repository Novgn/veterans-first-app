/**
 * Family-side read-only ride detail (Story 4.3, extended in 4.10).
 *
 * Shows the ride's status, addresses, driver, timeline, and arrival photo
 * when the trip completed with one. No mutation actions are rendered for
 * family users.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { useFamilyRideDetail, type FamilyRideEvent } from '@/hooks/useFamilyRiderRides';

function formatEvent(event: FamilyRideEvent): string {
  const ts = (() => {
    try {
      return format(new Date(event.created_at), 'h:mm a');
    } catch {
      return event.created_at;
    }
  })();
  return `${event.event_type.replace(/_/g, ' ')} · ${ts}`;
}

export default function FamilyRideDetailScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const { data: ride, isLoading } = useFamilyRideDetail(rideId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ActivityIndicator size="large" color="#1E40AF" className="mt-12" />
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Ride' }} />
        <View className="mt-12 items-center px-6">
          <Text className="text-base text-gray-600">This ride is unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const arrivalEvent = ride.events.find((e) => e.event_type === 'arrived' && e.photo_url);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Ride' }} />
      <ScrollView className="flex-1 px-6 pt-4" testID="family-ride-detail">
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <Text className="text-xs uppercase text-gray-500">Scheduled pickup</Text>
          <Text className="mt-1 text-lg font-semibold text-foreground">
            {(() => {
              try {
                return format(new Date(ride.scheduled_pickup_time), "EEE MMM d 'at' h:mm a");
              } catch {
                return ride.scheduled_pickup_time;
              }
            })()}
          </Text>
        </View>

        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-3 flex-row items-start">
            <Ionicons name="navigate" size={20} color="#1E40AF" />
            <View className="ml-2 flex-1">
              <Text className="text-xs uppercase text-gray-500">Pickup</Text>
              <Text className="text-base text-foreground">{ride.pickup_address}</Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="flag" size={20} color="#059669" />
            <View className="ml-2 flex-1">
              <Text className="text-xs uppercase text-gray-500">Drop-off</Text>
              <Text className="text-base text-foreground">{ride.dropoff_address}</Text>
            </View>
          </View>
        </View>

        {ride.driver ? (
          <View className="mb-4 flex-row items-center rounded-xl bg-white p-4 shadow-sm">
            {ride.driver.profile_photo_url ? (
              <Image
                source={{ uri: ride.driver.profile_photo_url }}
                className="mr-3 h-12 w-12 rounded-full"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="person" size={22} color="#1E40AF" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xs uppercase text-gray-500">Driver</Text>
              <Text className="text-base font-semibold text-foreground">
                {ride.driver.first_name} {ride.driver.last_name}
              </Text>
            </View>
          </View>
        ) : null}

        <Text className="mb-2 text-lg font-semibold text-foreground">Status timeline</Text>
        <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          {ride.events.length === 0 ? (
            <Text className="text-sm text-gray-600">No events recorded yet.</Text>
          ) : (
            ride.events.map((event, idx) => (
              <View
                key={event.id}
                className={`${idx > 0 ? 'mt-3 border-t border-gray-100 pt-3' : ''} flex-row items-center`}
                testID={`family-ride-event-${event.event_type}`}>
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Ionicons name="checkmark" size={16} color="#1E40AF" />
                </View>
                <Text className="flex-1 text-sm text-foreground">{formatEvent(event)}</Text>
              </View>
            ))
          )}
        </View>

        {arrivalEvent?.photo_url ? (
          <View className="mb-8 rounded-xl bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold text-foreground">Arrival photo</Text>
            <Image
              source={{ uri: arrivalEvent.photo_url }}
              className="h-64 w-full rounded-xl"
              resizeMode="cover"
              accessibilityLabel="Arrival confirmation photo"
              accessibilityIgnoresInvertColors
              testID="family-ride-arrival-photo"
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
