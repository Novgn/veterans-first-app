/**
 * EmptyTripQueue component
 *
 * Displays friendly empty state when driver has no assigned rides.
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

interface EmptyTripQueueProps {
  testID?: string;
}

export function EmptyTripQueue({ testID }: EmptyTripQueueProps) {
  return (
    <View
      testID={testID}
      className="items-center justify-center rounded-xl bg-white p-8 shadow-sm"
      accessibilityLabel="No rides assigned yet">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Ionicons name="calendar-outline" size={32} color="#1E40AF" />
      </View>
      <Text className="text-lg font-semibold text-foreground">No rides assigned yet</Text>
      <Text className="mt-2 text-center text-gray-600">
        When you&apos;re available, assigned rides will appear here.
      </Text>
    </View>
  );
}
