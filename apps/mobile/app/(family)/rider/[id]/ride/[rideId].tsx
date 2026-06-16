/**
 * Family-side read-only ride detail (Story 4.3, extended in 4.10).
 *
 * Shows the ride's status, addresses, driver, timeline, and arrival photo
 * when the trip completed with one. No mutation actions are rendered for
 * family users.
 *
 * Veteran Honor: white cards on the stone canvas, navy/sage route dots,
 * read-only DriverCard, success-cued arrival photo as trust proof, warm
 * voice ("{Rider} arrived safely."). Family owns no modify/cancel controls.
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
        <ActivityIndicator size="large" color="#1F3A5F" className="mt-12" />
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Ride' }} />
        <View className="mt-12 items-center px-6">
          <Text className="font-sans text-body text-ink-secondary">This ride is unavailable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const arrivalEvent = ride.events.find((e) => e.event_type === 'arrived' && e.photo_url);
  const riderFirstName = ride.rider?.first_name ?? 'Your loved one';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Ride' }} />
      <ScrollView className="flex-1 px-6 pt-4" testID="family-ride-detail">
        <View className="border-hairline mb-4 rounded-lg border bg-card p-6 shadow-card">
          <Text className="font-sans text-caption text-ink-secondary">Scheduled pickup</Text>
          <Text className="mt-1 font-sans-semibold text-headline text-foreground">
            {(() => {
              try {
                return format(new Date(ride.scheduled_pickup_time), "EEE MMM d 'at' h:mm a");
              } catch {
                return ride.scheduled_pickup_time;
              }
            })()}
          </Text>
        </View>

        <View className="border-hairline mb-4 rounded-lg border bg-card p-6 shadow-card">
          <View className="mb-3 flex-row items-start">
            <Ionicons name="navigate" size={20} color="#4A6B54" />
            <View className="ml-3 flex-1">
              <Text className="font-sans text-caption text-ink-secondary">Pickup</Text>
              <Text className="font-sans-medium text-base text-foreground">
                {ride.pickup_address}
              </Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="flag" size={20} color="#1F3A5F" />
            <View className="ml-3 flex-1">
              <Text className="font-sans text-caption text-ink-secondary">Drop-off</Text>
              <Text className="font-sans-medium text-base text-foreground">
                {ride.dropoff_address}
              </Text>
            </View>
          </View>
        </View>

        {ride.driver ? (
          <View className="border-hairline mb-4 flex-row items-center rounded-lg border bg-card p-6 shadow-card">
            {ride.driver.profile_photo_url ? (
              <Image
                source={{ uri: ride.driver.profile_photo_url }}
                className="mr-4 h-12 w-12 rounded-full"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Ionicons name="person" size={22} color="#1F3A5F" />
              </View>
            )}
            <View className="flex-1">
              <Text className="font-sans text-caption text-ink-secondary">
                {riderFirstName}&apos;s driver
              </Text>
              <Text className="font-sans-semibold text-headline text-foreground">
                {ride.driver.first_name} {ride.driver.last_name}
              </Text>
            </View>
          </View>
        ) : null}

        <Text className="mb-2 font-sans-semibold text-title-3 text-foreground">
          Status timeline
        </Text>
        <View className="border-hairline mb-6 rounded-lg border bg-card p-6 shadow-card">
          {ride.events.length === 0 ? (
            <Text className="font-sans text-body text-ink-secondary">No events recorded yet.</Text>
          ) : (
            ride.events.map((event, idx) => (
              <View
                key={event.id}
                className={`${idx > 0 ? 'border-hairline mt-3 border-t pt-3' : ''} flex-row items-center`}
                testID={`family-ride-event-${event.event_type}`}>
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-success">
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <Text className="flex-1 font-sans text-base text-foreground">
                  {formatEvent(event)}
                </Text>
              </View>
            ))
          )}
        </View>

        {arrivalEvent?.photo_url ? (
          <View className="border-hairline mb-8 rounded-lg border bg-card p-6 shadow-card">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#356046" />
              <Text className="ml-2 font-sans-semibold text-headline text-foreground">
                {riderFirstName} arrived safely.
              </Text>
            </View>
            <Image
              source={{ uri: arrivalEvent.photo_url }}
              className="h-64 w-full rounded-lg"
              resizeMode="cover"
              accessibilityLabel={`Arrival confirmation photo of ${riderFirstName} at the door`}
              accessibilityIgnoresInvertColors
              testID="family-ride-arrival-photo"
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
