import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { useRole } from '@/lib/auth/use-role';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { role, isLoading: roleLoading } = useRole();

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
      // Web-only roles — surface a friendly message rather than auto-routing.
      return <Redirect href="/(auth)/sign-in" />;
    case 'rider':
    case null:
    default:
      // Default to rider (most common role) when role is unset.
      return <Redirect href="/(rider)" />;
  }
}
