/**
 * Family-facing rider dashboard (Story 4.3).
 *
 * Read-only view of a linked rider's upcoming and past rides. No
 * modify/cancel actions — those stay in the rider app.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { useFamilyLinks } from '@/hooks/useFamilyLinks';
import { useFamilyRiderRides, type FamilyRideRow } from '@/hooks/useFamilyRiderRides';

function formatPickup(ride: FamilyRideRow): string {
  try {
    return format(new Date(ride.scheduled_pickup_time), "EEE MMM d 'at' h:mm a");
  } catch {
    return ride.scheduled_pickup_time;
  }
}

function statusTone(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'no_show':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
    case 'en_route':
    case 'arrived':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function RideCard({ ride }: { ride: FamilyRideRow }) {
  return (
    <Link
      href={{
        pathname: '/rider/[id]/ride/[rideId]',
        params: { id: ride.rider_id, rideId: ride.id },
      }}
      asChild>
      <Pressable
        className="mb-3 rounded-xl bg-white p-4 shadow-sm"
        accessibilityLabel={`View ride details for ${formatPickup(ride)}`}
        accessibilityRole="button"
        testID={`family-ride-card-${ride.id}`}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground">{formatPickup(ride)}</Text>
          <View className={`rounded-full px-2 py-0.5 ${statusTone(ride.status)}`}>
            <Text className="text-xs font-medium">{ride.status.replace(/_/g, ' ')}</Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <Ionicons name="navigate" size={16} color="#1E40AF" />
          <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
            {ride.pickup_address}
          </Text>
        </View>
        <View className="mt-1 flex-row items-start">
          <Ionicons name="flag" size={16} color="#059669" />
          <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
            {ride.dropoff_address}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function FamilyRiderDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useFamilyRiderRides(id);
  const { data: links = [] } = useFamilyLinks('family');

  const upcoming = data?.upcoming ?? [];
  const history = data?.history ?? [];
  const link = links.find((l) => l.rider_id === id && l.status === 'approved');
  const canBook = !!link?.permissions?.book_rides;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Rides' }} />

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E40AF" className="mt-12" />
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" testID="family-rider-dashboard">
          {canBook ? (
            <Link href={{ pathname: '/rider/[id]/book', params: { id: id ?? '' } }} asChild>
              <Pressable
                className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary"
                accessibilityLabel="Book a ride"
                accessibilityRole="button"
                testID="family-book-ride-button">
                <Ionicons name="car" size={22} color="#ffffff" />
                <Text className="ml-2 text-lg font-semibold text-white">Book a Ride</Text>
              </Pressable>
            </Link>
          ) : null}

          <Text className="mb-3 text-lg font-semibold text-foreground">Upcoming</Text>
          {upcoming.length === 0 ? (
            <View className="mb-6 items-center rounded-xl bg-white p-4 shadow-sm">
              <Text className="text-sm text-gray-600">No upcoming rides.</Text>
            </View>
          ) : (
            upcoming.map((ride) => <RideCard key={ride.id} ride={ride} />)
          )}

          <Text className="mb-3 mt-4 text-lg font-semibold text-foreground">History</Text>
          {history.length === 0 ? (
            <View className="mb-12 items-center rounded-xl bg-white p-4 shadow-sm">
              <Text className="text-sm text-gray-600">No completed rides yet.</Text>
            </View>
          ) : (
            history.map((ride) => <RideCard key={ride.id} ride={ride} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
