import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, SafeAreaView, Pressable } from 'react-native';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 min-h-[48px] min-w-[48px] items-center justify-center"
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#1E40AF" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Trip Details</Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="car" size={40} color="#1E40AF" />
        </View>
        <Text className="text-xl font-bold text-foreground">Trip Details Coming Soon</Text>
        <Text className="mt-2 text-center text-gray-600">Trip ID: {id}</Text>
        <Text className="mt-4 text-center text-gray-500">
          Active trip management will be available in upcoming stories.
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-8 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary px-8"
          accessibilityLabel="Return to home"
          accessibilityRole="button">
          <Ionicons name="home" size={20} color="white" />
          <Text className="ml-2 text-lg font-semibold text-white">Return Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
