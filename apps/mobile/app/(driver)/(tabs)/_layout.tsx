import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';

export default function TabLayout() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Check if user has driver role
  const userRole = user?.publicMetadata?.role as string | undefined;
  if (userRole !== 'driver') {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <Ionicons name="warning" size={48} color="#EF4444" />
        </View>
        <Text className="mt-4 text-center text-xl font-bold text-foreground">
          Driver Access Only
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          This app is for verified drivers only. Please use the Rider app to book rides.
        </Text>
        <Pressable
          onPress={() => signOut()}
          className="mt-6 min-h-[56px] w-full items-center justify-center rounded-xl bg-red-500"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          accessibilityHint="Sign out of the driver app">
          <Text className="text-lg font-semibold text-white">Sign Out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: '#FAFAF9',
          borderTopColor: '#E5E5E5',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          minHeight: 48,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Home tab - View your trip queue',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Schedule tab - View your upcoming rides',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Earnings tab - Track your earnings',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Profile tab - Manage your profile',
        }}
      />
    </Tabs>
  );
}
