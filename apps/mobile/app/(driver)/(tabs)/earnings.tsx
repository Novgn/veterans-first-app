import { Ionicons } from '@expo/vector-icons';
import { View, Text, SafeAreaView } from 'react-native';

export default function EarningsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Ionicons name="wallet" size={40} color="#059669" />
        </View>
        <Text className="text-xl font-bold text-foreground">Earnings</Text>
        <Text className="mt-2 text-center text-gray-600">
          Track your earnings and payment history.
        </Text>
        <Text className="mt-4 text-sm text-gray-400">Coming in Story 3.8</Text>
      </View>
    </SafeAreaView>
  );
}
