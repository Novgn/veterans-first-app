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
      className={`rounded-2xl p-4 ${emphasis ? 'bg-primary' : 'border border-gray-200 bg-white'}`}
      testID={testID}>
      <Text
        className={`text-xs font-semibold uppercase ${emphasis ? 'text-white/80' : 'text-gray-500'}`}>
        {label}
      </Text>
      <Text className={`mt-1 text-3xl font-bold ${emphasis ? 'text-white' : 'text-foreground'}`}>
        {formatMoneyCents(amount)}
      </Text>
      {typeof count === 'number' ? (
        <Text className={`mt-1 text-sm ${emphasis ? 'text-white/70' : 'text-gray-500'}`}>
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
        <ActivityIndicator size="large" color="#1E40AF" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle" size={32} color="#DC2626" />
        <Text className="mt-2 text-lg font-semibold text-foreground">Could not load earnings</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="border-b border-gray-200 px-4 py-4">
          <Text className="text-xl font-bold text-foreground">Earnings</Text>
          <Text className="mt-1 text-sm text-gray-600">From completed rides only.</Text>
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
            className="mt-1 rounded-2xl border border-gray-200 bg-white p-4"
            testID="stat-alltime">
            <Text className="text-xs font-semibold uppercase text-gray-500">All Time</Text>
            <Text className="mt-1 text-2xl font-bold text-foreground">
              {formatMoneyCents(data.allTimeCents)}
            </Text>
          </View>
        </View>

        <View className="px-4">
          <Text className="mb-2 text-lg font-semibold text-foreground">Recent Trips</Text>
          {data.recent.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="car-outline" size={48} color="#9CA3AF" />
              <Text className="mt-2 text-center text-gray-500">
                Completed trips will appear here.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {data.recent.map((trip) => (
                <View
                  key={trip.id}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                  testID={`recent-trip-${trip.id}`}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500">
                      {trip.completedAt ? format(new Date(trip.completedAt), 'MMM d, h:mm a') : '—'}
                    </Text>
                    <Text className="text-base font-bold text-green-700">
                      {formatMoneyCents(trip.fareCents)}
                    </Text>
                  </View>
                  <Text className="mt-2 text-sm text-foreground" numberOfLines={1}>
                    {trip.pickupAddress}
                  </Text>
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    → {trip.dropoffAddress}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
