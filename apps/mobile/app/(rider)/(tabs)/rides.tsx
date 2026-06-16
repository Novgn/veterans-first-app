/**
 * My Rides Screen (Tab)
 *
 * Lists upcoming and past rides with navigation to ride details.
 * Supports pull-to-refresh for status updates and real-time subscriptions.
 *
 * Features:
 * - Segmented control (Upcoming / Past) to isolate each list
 * - Shows upcoming rides with RideCard (includes StatusTimeline and driver info)
 * - Shows past rides with compact RideListItem
 * - Tap ride navigates to RideDetailScreen
 * - Real-time updates via Supabase subscriptions
 * - Pull-to-refresh for manual updates
 * - Skeleton loading, inline Alert empty/error states
 * - Full accessibility support
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { router } from 'expo-router';
import { useMemo, useCallback, useState } from 'react';
import { View, SafeAreaView, FlatList, RefreshControl } from 'react-native';

import { RideCard, RideListItem, type RideWithDriver } from '@/components/rides';
import { Alert, AppHeader, Card, SectionHeader, SelectButton } from '@/components/ui';
import { useRides } from '@/hooks/useRides';

type Segment = 'upcoming' | 'past';

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

export default function RidesScreen() {
  const { data: rides, isLoading, error, refetch, isRefetching } = useRides();
  const [segment, setSegment] = useState<Segment>('upcoming');

  const handleRidePress = useCallback((rideId: string) => {
    router.push(`/rides/${rideId}`);
  }, []);

  const handleBookRide = useCallback(() => {
    router.push('/booking');
  }, []);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const { upcoming, past } = useMemo(() => {
    if (!rides || rides.length === 0) {
      return { upcoming: [] as RideWithDriver[], past: [] as RideWithDriver[] };
    }
    return categorizeRides(rides);
  }, [rides]);

  const visibleRides = segment === 'upcoming' ? upcoming : past;

  const renderItem = useCallback(
    ({ item }: { item: RideWithDriver }) => {
      if (segment === 'upcoming') {
        return <RideCard ride={item} onPress={() => handleRidePress(item.id)} className="mb-4" />;
      }

      return <RideListItem ride={item} onPress={() => handleRidePress(item.id)} className="mb-2" />;
    },
    [segment, handleRidePress]
  );

  const keyExtractor = useCallback((item: RideWithDriver) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader mode="brand" />

      {/* Segmented control: Upcoming / Past */}
      <View className="flex-row gap-2 px-6 pb-2 pt-3">
        <View className="flex-1">
          <SelectButton
            label="Upcoming"
            size="md"
            variant="filled"
            selected={segment === 'upcoming'}
            onPress={() => setSegment('upcoming')}
            fullWidth
            accessibilityHint="Show upcoming rides"
            testID="rides-segment-upcoming"
          />
        </View>
        <View className="flex-1">
          <SelectButton
            label="Past"
            size="md"
            variant="filled"
            selected={segment === 'past'}
            onPress={() => setSegment('past')}
            fullWidth
            accessibilityHint="Show past rides"
            testID="rides-segment-past"
          />
        </View>
      </View>

      <View className="flex-1 px-6 pt-2">
        {isLoading ? (
          // Skeleton loading — three flat cards stand in for rows until data arrives
          <View accessibilityLabel="Loading rides" accessible>
            <Card variant="flat" padding="lg" className="mb-4 h-32">
              <View />
            </Card>
            <Card variant="flat" padding="lg" className="mb-4 h-32">
              <View />
            </Card>
            <Card variant="flat" padding="lg" className="mb-4 h-32">
              <View />
            </Card>
          </View>
        ) : error ? (
          <Alert
            variant="error"
            title="Unable to load rides"
            message="We couldn't load your rides. Please check your connection and try again."
            action={{ label: 'Try again', onPress: handleRetry }}
          />
        ) : visibleRides.length === 0 ? (
          segment === 'upcoming' ? (
            <Alert
              variant="info"
              title="No upcoming rides"
              message="Book your next ride when you're ready."
              action={{ label: 'Book a ride', onPress: handleBookRide }}
            />
          ) : (
            <Alert
              variant="info"
              title="No past rides yet"
              message="Once you've taken a ride, it'll show up here."
            />
          )
        ) : (
          <FlatList
            data={visibleRides}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
              segment === 'upcoming' && upcoming.length > 0 ? (
                <View className="mb-2 mt-2">
                  <SectionHeader
                    title="Scheduled"
                    hint={`${upcoming.length} ${upcoming.length === 1 ? 'ride' : 'rides'} scheduled`}
                  />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                colors={['#1F3A5F']}
                tintColor="#1F3A5F"
              />
            }
            ListFooterComponent={<View className="h-4" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
