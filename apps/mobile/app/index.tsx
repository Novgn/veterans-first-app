import { useAuth, useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, Text, View } from 'react-native';

import { useRole } from '@/lib/auth/use-role';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { role, isLoading: roleLoading } = useRole();
  const { signOut } = useClerk();

  if (!isLoaded || roleLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  switch (role) {
    case 'driver':
      return <Redirect href="/(driver)" />;
    case 'family':
      return <Redirect href="/(family)" />;
    case 'dispatcher':
    case 'admin':
      // Web-only roles: surface a clear message. Auto-redirecting to
      // /(auth)/sign-in here causes an infinite loop because the auth
      // layout sends signed-in users back to /. Provide a manual sign-out
      // so the user can re-authenticate as a different identity if needed.
      return (
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-1 items-center justify-center px-6">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="desktop-outline" size={48} color="#1E40AF" />
            </View>
            <Text className="text-center text-2xl font-bold text-foreground">Use the Web App</Text>
            <Text className="mt-3 text-center text-base text-gray-600">
              Dispatcher and admin tools live in the Veterans 1st web console. The mobile app is for
              riders, drivers, and family members.
            </Text>
            <Pressable
              onPress={() => signOut()}
              className="mt-8 min-h-[56px] w-full max-w-xs items-center justify-center rounded-xl bg-primary"
              accessibilityLabel="Sign out"
              accessibilityRole="button">
              <Text className="text-lg font-semibold text-white">Sign Out</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    case 'rider':
    case null:
    default:
      // Default to rider (most common role) when role is unset.
      return <Redirect href="/(rider)" />;
  }
}
