import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, SafeAreaView, Pressable } from 'react-native';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
        </View>

        {/* User Info Card */}
        <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="person" size={32} color="#1E40AF" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-gray-600">Driver</Text>
            </View>
          </View>
        </View>

        {/* Profile Options Placeholder */}
        <View className="mb-6 items-center justify-center rounded-xl bg-white p-8 shadow-sm">
          <Ionicons name="settings-outline" size={32} color="#9CA3AF" />
          <Text className="mt-2 text-center text-gray-600">
            Profile settings and driver information will be available here.
          </Text>
          <Text className="mt-4 text-sm text-gray-400">Coming in Story 3.11</Text>
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={() => signOut()}
          className="min-h-[56px] flex-row items-center justify-center rounded-xl border border-red-500 bg-white"
          accessibilityLabel="Sign out"
          accessibilityRole="button">
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="ml-2 text-lg font-semibold text-red-500">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
