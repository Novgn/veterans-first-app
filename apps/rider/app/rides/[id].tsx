import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable, SafeAreaView } from 'react-native';

import { Header } from '../../src/components/Header';

export default function RideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Header />
      <View className="px-4 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-[48px] w-[48px] items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#1E40AF" />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="car" size={64} color="#9CA3AF" />
        <Text className="mt-4 text-center text-lg font-medium text-gray-700">
          Ride details for ID: {id}
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          Detailed ride information coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
