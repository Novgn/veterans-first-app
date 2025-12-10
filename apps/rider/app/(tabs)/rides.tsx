import { Ionicons } from '@expo/vector-icons';
import { View, Text, SafeAreaView } from 'react-native';

import { Header } from '../../src/components/Header';

export default function Rides() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <View className="flex-1 px-6 pt-4">
        <Text className="mb-6 text-2xl font-bold text-foreground">My Rides</Text>

        <View className="flex-1 items-center justify-center rounded-xl bg-gray-100 p-8">
          <Ionicons name="car-outline" size={64} color="#9CA3AF" />
          <Text className="mt-4 text-center text-lg font-medium text-gray-700">No rides yet</Text>
          <Text className="mt-2 text-center text-gray-500">
            Your upcoming and past rides will appear here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
