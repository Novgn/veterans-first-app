import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

export default function TabLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        // Veteran Honor bottom tabs: navy active, ink-secondary resting,
        // warm-stone chrome with a hairline top divider. Lexend labels.
        tabBarActiveTintColor: '#1F3A5F',
        tabBarInactiveTintColor: '#4F4A41',
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: '#F4F1EA',
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
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'My Rides',
          tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} />,
          tabBarAccessibilityLabel: 'My Rides tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Help',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Help tab',
        }}
      />
    </Tabs>
  );
}
