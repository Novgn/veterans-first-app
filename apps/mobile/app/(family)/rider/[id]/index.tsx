/**
 * Family-facing rider dashboard (Story 4.3).
 *
 * Read-only view of a linked rider's upcoming and past rides. No
 * modify/cancel actions — those stay in the rider app.
 *
 * Veteran Honor: white ride cards on the stone canvas, navy/sage route dots,
 * StatusBadge pill, Lexend type, warm read-only voice. Family sees no
 * modify/cancel affordances.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { StatusBadge, type StatusBadgeStatus } from '@/components/ui/StatusBadge';
import { useFamilyLinks } from '@/hooks/useFamilyLinks';
import { useFamilyRiderRides, type FamilyRideRow } from '@/hooks/useFamilyRiderRides';

function formatPickup(ride: FamilyRideRow): string {
  try {
    return format(new Date(ride.scheduled_pickup_time), "EEE MMM d 'at' h:mm a");
  } catch {
    return ride.scheduled_pickup_time;
  }
}

// Map the family ride status strings onto the StatusBadge color union without
// changing the displayed text — the human-readable label is always shown.
function badgeStatus(status: string): StatusBadgeStatus {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'no_show':
      return 'cancelled';
    case 'in_progress':
    case 'en_route':
    case 'arrived':
      return 'in_progress';
    case 'assigned':
      return 'assigned';
    case 'confirmed':
      return 'confirmed';
    default:
      return 'pending';
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
        className="border-hairline mb-3 rounded-lg border bg-card p-6 shadow-card active:bg-background"
        accessibilityLabel={`View ride details for ${formatPickup(ride)}`}
        accessibilityRole="button"
        testID={`family-ride-card-${ride.id}`}>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-sans-semibold text-headline text-foreground">
            {formatPickup(ride)}
          </Text>
          <StatusBadge status={badgeStatus(ride.status)} label={ride.status.replace(/_/g, ' ')} />
        </View>
        <View className="flex-row">
          {/* Route line — sage pickup, navy dropoff, hairline connector */}
          <View className="mr-3 items-center pt-1">
            <View className="h-2.5 w-2.5 rounded-full bg-secondary" />
            <View className="h-6 w-0.5 bg-border-hairline" />
            <View className="h-2.5 w-2.5 rounded-full bg-primary" />
          </View>
          <View className="flex-1">
            <Text className="font-sans text-caption text-ink-secondary">Pickup</Text>
            <Text className="font-sans-medium text-base text-foreground" numberOfLines={1}>
              {ride.pickup_address}
            </Text>
            <View className="h-2" />
            <Text className="font-sans text-caption text-ink-secondary">Destination</Text>
            <Text className="font-sans-medium text-base text-foreground" numberOfLines={1}>
              {ride.dropoff_address}
            </Text>
          </View>
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
  const riderFirstName = link?.counterpart?.first_name;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Rides' }} />

      {isLoading ? (
        <ActivityIndicator size="large" color="#1F3A5F" className="mt-12" />
      ) : (
        <ScrollView className="flex-1 px-6 pt-4" testID="family-rider-dashboard">
          {canBook ? (
            <Link href={{ pathname: '/rider/[id]/book', params: { id: id ?? '' } }} asChild>
              <Button
                label={riderFirstName ? `Book for ${riderFirstName}` : 'Book a Ride'}
                variant="primary"
                size="lg"
                className="mb-4"
                leftIcon={<Ionicons name="car" size={22} color="#FFFFFF" />}
                accessibilityLabel="Book a ride"
                testID="family-book-ride-button"
              />
            </Link>
          ) : null}

          <Text className="mb-3 font-sans-semibold text-title-3 text-foreground">Upcoming</Text>
          {upcoming.length === 0 ? (
            <View className="border-hairline mb-6 items-center rounded-lg border bg-card p-6 shadow-card">
              <Text className="font-sans text-body text-ink-secondary">No upcoming rides.</Text>
            </View>
          ) : (
            upcoming.map((ride) => <RideCard key={ride.id} ride={ride} />)
          )}

          <Text className="mb-3 mt-4 font-sans-semibold text-title-3 text-foreground">History</Text>
          {history.length === 0 ? (
            <View className="border-hairline mb-12 items-center rounded-lg border bg-card p-6 shadow-card">
              <Text className="font-sans text-body text-ink-secondary">
                No completed rides yet.
              </Text>
            </View>
          ) : (
            history.map((ride) => <RideCard key={ride.id} ride={ride} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
