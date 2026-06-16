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
        <ActivityIndicator size="large" color="#1F3A5F" />
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
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-error-100">
          <Ionicons name="warning" size={48} color="#A83A35" />
        </View>
        <Text className="mt-4 text-center font-sans-bold text-title-2 text-foreground">
          Driver Access Only
        </Text>
        <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
          This app is for verified drivers only. Please use the Rider app to book rides.
        </Text>
        <Pressable
          onPress={() => signOut()}
          className="mt-6 min-h-touch-lg w-full items-center justify-center rounded-md bg-primary"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          accessibilityHint="Sign out of the driver app">
          <Text className="font-sans-semibold text-headline text-white">Sign Out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        // Veteran Honor tab chrome: navy active, ink-secondary inactive, white
        // raised surface on the stone canvas, hairline top divider, Lexend labels.
        tabBarActiveTintColor: '#1F3A5F',
        tabBarInactiveTintColor: '#4F4A41',
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#DAD3C6',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'Lexend_600SemiBold',
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
