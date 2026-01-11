import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';

import { StatusToggle } from '../../src/features/trips/components';
import { useTripStore } from '../../src/stores/tripStore';

export default function HomeScreen() {
  const { user } = useUser();
  const { status, setStatus } = useTripStore();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">
            {getGreeting()}, {user?.firstName || 'Driver'}
          </Text>
          <Text className="text-gray-600">Ready to start driving?</Text>
        </View>

        {/* Status Toggle */}
        <View className="mb-6">
          <StatusToggle value={status} onChange={setStatus} testID="driver-status-toggle" />
        </View>

        {/* Trip Queue Placeholder */}
        <View className="mb-6 items-center justify-center rounded-xl bg-white p-8 shadow-sm">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="car" size={32} color="#1E40AF" />
          </View>
          <Text className="text-lg font-semibold text-foreground">Trip Queue</Text>
          <Text className="mt-2 text-center text-gray-600">
            Your assigned trips will appear here. Coming in Story 3.2.
          </Text>
        </View>

        {/* Quick Stats Placeholder */}
        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 items-center rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-primary">0</Text>
            <Text className="text-sm text-gray-600">Today&apos;s Trips</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-green-600">$0</Text>
            <Text className="text-sm text-gray-600">Today&apos;s Earnings</Text>
          </View>
        </View>

        {/* Status Info */}
        {status === 'available' && (
          <View className="mb-6 flex-row items-center rounded-xl border border-green-200 bg-green-50 p-4">
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text className="ml-3 flex-1 text-green-800">
              You&apos;re available for trips. New ride requests will appear in your queue.
            </Text>
          </View>
        )}

        {status === 'offline' && (
          <View className="mb-6 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Ionicons name="moon" size={24} color="#6B7280" />
            <Text className="ml-3 flex-1 text-gray-700">
              You&apos;re offline. Set your status to Available to receive trip requests.
            </Text>
          </View>
        )}

        {status === 'on_trip' && (
          <View className="mb-6 flex-row items-center rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Ionicons name="car" size={24} color="#1E40AF" />
            <Text className="ml-3 flex-1 text-blue-800">
              You&apos;re on a trip. Complete your current trip to receive new requests.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
