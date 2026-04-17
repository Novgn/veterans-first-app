import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, Text, View } from 'react-native';

export default function FamilyHome() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-100">
          <Ionicons name="people" size={48} color="#1E40AF" />
        </View>
        <Text className="text-center text-2xl font-bold text-foreground">Family Dashboard</Text>
        <Text className="mt-3 text-center text-base text-gray-600">
          Coming soon. The family dashboard launches with Epic 4 — track loved ones&apos; rides,
          receive arrival notifications, and book rides on their behalf.
        </Text>
      </View>
    </SafeAreaView>
  );
}
