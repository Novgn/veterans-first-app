import { useAuth, useUser } from '@clerk/clerk-expo';
import { View, Text, Pressable } from 'react-native';

export default function Home() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View className="flex-1 bg-[#FAFAF9] p-6">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900">
          Welcome, {user?.firstName || 'Driver'}!
        </Text>
        <Text className="mt-1 text-lg text-gray-600">Ready to accept rides?</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="mb-4 text-center text-lg text-gray-500">
          Driver features coming soon...
        </Text>
      </View>

      <Pressable
        onPress={() => signOut()}
        className="h-14 items-center justify-center rounded-lg bg-gray-200">
        <Text className="text-lg font-semibold text-gray-700">Sign Out</Text>
      </Pressable>
    </View>
  );
}
