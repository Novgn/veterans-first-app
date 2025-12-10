import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { View, Text, Pressable, SafeAreaView } from 'react-native';

import { Header } from '../../src/components/Header';

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <View className="flex-1 px-6 pt-4">
        <Text className="mb-6 text-2xl font-bold text-foreground">Profile</Text>

        {/* User Info Card */}
        <View className="mb-6 items-center rounded-xl bg-white p-6 shadow-sm">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            <Ionicons name="person" size={40} color="#1E40AF" />
          </View>
          <Text className="text-xl font-semibold text-foreground">
            {user?.firstName || 'Rider'}
          </Text>
        </View>

        {/* Menu Items */}
        <View className="mb-6 rounded-xl bg-white shadow-sm">
          {/* Saved Places Menu Item */}
          <Link href="/profile/saved-places" asChild>
            <Pressable
              className="h-[56px] flex-row items-center justify-between border-b border-gray-100 px-4"
              accessibilityLabel="Saved Places"
              accessibilityRole="button"
              accessibilityHint="Navigate to your saved places">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="location" size={20} color="#1E40AF" />
                </View>
                <Text className="text-lg font-medium text-foreground">Saved Places</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </Link>

          {/* Placeholder for future menu items */}
          <View className="h-[56px] flex-row items-center justify-between px-4 opacity-50">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="settings-outline" size={20} color="#6B7280" />
              </View>
              <Text className="text-lg font-medium text-gray-600">Settings</Text>
            </View>
            <Text className="text-sm text-gray-400">Coming Soon</Text>
          </View>
        </View>

        <View className="flex-1" />

        {/* Sign Out Button */}
        <Pressable
          onPress={handleSignOut}
          className="mb-6 h-[56px] flex-row items-center justify-center rounded-xl bg-gray-200"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          accessibilityHint="Signs you out of the app">
          <Ionicons name="log-out-outline" size={24} color="#374151" />
          <Text className="ml-3 text-lg font-semibold text-gray-700">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
