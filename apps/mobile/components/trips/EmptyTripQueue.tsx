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
      className="border-hairline items-center justify-center rounded-lg border bg-card p-8 shadow-card"
      accessibilityLabel="No rides assigned yet">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary-100">
        <Ionicons name="calendar-outline" size={32} color="#1F3A5F" />
      </View>
      <Text className="font-sans-semibold text-headline text-foreground">
        No rides assigned yet
      </Text>
      <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
        When you&apos;re available, assigned rides will appear here.
      </Text>
    </View>
  );
}
