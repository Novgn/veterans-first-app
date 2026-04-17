import { Ionicons } from '@expo/vector-icons';
import { View, Text, SafeAreaView } from 'react-native';

export default function ScheduleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="calendar" size={40} color="#1E40AF" />
        </View>
        <Text className="text-xl font-bold text-foreground">Schedule</Text>
        <Text className="mt-2 text-center text-gray-600">
          View your upcoming scheduled rides here.
        </Text>
        <Text className="mt-4 text-sm text-gray-400">Coming in Story 3.7</Text>
      </View>
    </SafeAreaView>
  );
}
