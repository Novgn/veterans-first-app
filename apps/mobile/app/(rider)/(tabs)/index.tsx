import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View, Text, Pressable, SafeAreaView } from 'react-native';

import { Header } from '@rider/components/Header';

export default function Home() {
  const { user } = useUser();

  const handleBookRide = () => {
    router.push('/booking');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <View className="flex-1 px-6 pt-4">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-foreground">
            Welcome, {user?.firstName || 'Rider'}!
          </Text>
          <Text className="mt-1 text-lg text-gray-700">Ready to book your next ride?</Text>
        </View>

        <Pressable
          onPress={handleBookRide}
          className="h-[56px] flex-row items-center justify-center rounded-xl bg-primary"
          accessibilityLabel="Book a Ride"
          accessibilityRole="button"
          accessibilityHint="Opens the booking wizard to schedule a new ride">
          <Ionicons name="car" size={24} color="white" />
          <Text className="ml-3 text-lg font-bold text-white">Book a Ride</Text>
        </Pressable>

        <View className="mt-8 flex-1">
          <Text className="mb-4 text-lg font-semibold text-foreground">Upcoming Rides</Text>
          <View className="flex-1 items-center justify-center rounded-xl bg-gray-100 p-8">
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-center text-gray-500">No upcoming rides scheduled</Text>
            <Text className="mt-1 text-center text-sm text-gray-400">
              Book a ride to see it here
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
