/**
 * Driver Earnings screen (Story 3.8)
 *
 * Shows three headline numbers (Today / This Week / This Month) plus an
 * all-time total and a short list of recent completed trips. Data comes
 * from completed rides' `fare_cents` aggregated client-side; the query is
 * filtered + indexed by driver_id + status='completed'.
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui';
import { formatMoneyCents, useDriverEarnings } from '@/hooks/useDriverEarnings';

interface StatCardProps {
  label: string;
  amount: number;
  count?: number;
  emphasis?: boolean;
  testID?: string;
}

function StatCard({ label, amount, count, emphasis, testID }: StatCardProps) {
  return (
    <View
      className={`rounded-lg p-6 ${
        emphasis ? 'bg-primary' : 'border-hairline border bg-card shadow-card'
      }`}
      testID={testID}>
      <Text
        className={`font-sans-semibold text-caption uppercase ${
          emphasis ? 'text-white/80' : 'text-ink-secondary'
        }`}>
        {label}
      </Text>
      <Text
        className={`mt-1 font-sans-bold text-display ${emphasis ? 'text-white' : 'text-foreground'}`}>
        {formatMoneyCents(amount)}
      </Text>
      {typeof count === 'number' ? (
        <Text
          className={`mt-1 font-sans text-footnote ${
            emphasis ? 'text-white/80' : 'text-ink-secondary'
          }`}>
          {count} {count === 1 ? 'trip' : 'trips'}
        </Text>
      ) : null}
    </View>
  );
}

export default function EarningsScreen() {
  const { data, isLoading, error } = useDriverEarnings();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1F3A5F" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle" size={32} color="#A83A35" />
        <Text className="mt-2 font-sans-semibold text-headline text-foreground">
          Could not load earnings
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="border-hairline border-b px-4 py-4">
          <Text className="font-sans-bold text-title-1 text-foreground">Earnings</Text>
          <Text className="mt-1 font-sans text-footnote text-ink-secondary">
            From completed rides only.
          </Text>
        </View>

        <View className="gap-3 px-4 py-4">
          <StatCard
            label="Today"
            amount={data.todayCents}
            count={data.tripCountToday}
            emphasis
            testID="stat-today"
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard
                label="This Week"
                amount={data.weekCents}
                count={data.tripCountWeek}
                testID="stat-week"
              />
            </View>
            <View className="flex-1">
              <StatCard
                label="This Month"
                amount={data.monthCents}
                count={data.tripCountMonth}
                testID="stat-month"
              />
            </View>
          </View>

          <View
            className="border-hairline mt-1 rounded-lg border bg-card p-6 shadow-card"
            testID="stat-alltime">
            <Text className="font-sans-semibold text-caption uppercase text-ink-secondary">
              All Time
            </Text>
            <Text className="mt-1 font-sans-bold text-title-1 text-foreground">
              {formatMoneyCents(data.allTimeCents)}
            </Text>
          </View>
        </View>

        <View className="px-4">
          <Text className="mb-2 font-sans-semibold text-title-3 text-foreground">Recent Trips</Text>
          {data.recent.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="car-outline" size={48} color="#6E685E" />
              <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
                Completed trips will appear here.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {data.recent.map((trip) => (
                <View
                  key={trip.id}
                  className="border-hairline rounded-lg border bg-card p-6 shadow-card"
                  testID={`recent-trip-${trip.id}`}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-sans text-footnote text-ink-secondary">
                      {trip.completedAt ? format(new Date(trip.completedAt), 'MMM d, h:mm a') : '—'}
                    </Text>
                    <Text className="font-sans-bold text-headline text-foreground">
                      {formatMoneyCents(trip.fareCents)}
                    </Text>
                  </View>
                  <Text className="mt-2 font-sans text-body text-foreground" numberOfLines={1}>
                    {trip.pickupAddress}
                  </Text>
                  <Text className="font-sans text-body text-ink-secondary" numberOfLines={1}>
                    → {trip.dropoffAddress}
                  </Text>
                  <View className="mt-2">
                    <StatusBadge status="completed" size="sm" />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
