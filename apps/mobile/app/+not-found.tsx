import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { View, Text, Pressable, SafeAreaView } from 'react-native';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-bold text-foreground">Page Not Found</Text>
        <Text className="mt-2 text-center text-gray-600">This screen doesn&apos;t exist.</Text>
        <Link href="/" asChild>
          <Pressable
            className="mt-8 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary px-8"
            accessibilityLabel="Go to home screen"
            accessibilityRole="button">
            <Ionicons name="home" size={20} color="white" />
            <Text className="ml-2 text-lg font-semibold text-white">Go to Home</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
