import { useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

import type { UserRole } from '@veterans-first/shared';

interface WrongRoleScreenProps {
  expected: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  rider: 'rider',
  driver: 'driver',
  family: 'family member',
  dispatcher: 'dispatcher',
  admin: 'admin',
};

export function WrongRoleScreen({ expected }: WrongRoleScreenProps) {
  const { signOut } = useClerk();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <Ionicons name="warning" size={48} color="#DC2626" />
        </View>
        <Text className="text-center text-2xl font-bold text-foreground">Access Restricted</Text>
        <Text className="mt-3 text-center text-base text-gray-600">
          This area is for {ROLE_LABELS[expected]}s only. Please return home or sign out and sign
          back in with the correct account.
        </Text>
        <View className="mt-8 w-full max-w-xs gap-3">
          <Pressable
            onPress={() => router.replace('/')}
            className="min-h-[56px] items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Return home"
            accessibilityRole="button">
            <Text className="text-lg font-semibold text-white">Return Home</Text>
          </Pressable>
          <Pressable
            onPress={() => signOut()}
            className="min-h-[56px] items-center justify-center rounded-xl border border-gray-300"
            accessibilityLabel="Sign out"
            accessibilityRole="button">
            <Text className="text-lg font-semibold text-foreground">Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
