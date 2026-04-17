import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, View, Text, Pressable, SafeAreaView } from 'react-native';

import { Header } from '@rider/components/Header';
import { SUPPORT_PHONE } from '@rider/lib/constants';

export default function Help() {
  const handleCallSupport = async () => {
    const phoneUrl = `tel:${SUPPORT_PHONE}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Unable to Call', `Please call ${SUPPORT_PHONE} to reach support.`, [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <View className="flex-1 px-6 pt-4">
        <Text className="mb-6 text-2xl font-bold text-foreground">Help & Support</Text>

        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-foreground">Need Assistance?</Text>
          <Text className="mb-6 text-gray-700">
            Our support team is available to help you with booking rides, account questions, and any
            other assistance you may need.
          </Text>

          <Pressable
            onPress={handleCallSupport}
            className="h-[56px] flex-row items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Call Support"
            accessibilityRole="button"
            accessibilityHint="Opens your phone to call our support line">
            <Ionicons name="call" size={24} color="white" />
            <Text className="ml-3 text-lg font-bold text-white">Call Support</Text>
          </Pressable>
        </View>

        <View className="rounded-xl bg-gray-100 p-6">
          <Text className="mb-4 text-lg font-semibold text-foreground">Operating Hours</Text>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Monday - Friday</Text>
            <Text className="font-medium text-foreground">6:00 AM - 8:00 PM</Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-gray-700">Saturday - Sunday</Text>
            <Text className="font-medium text-foreground">8:00 AM - 6:00 PM</Text>
          </View>
        </View>

        <View className="mt-6 rounded-xl bg-gray-100 p-6">
          <Text className="text-center text-gray-500">
            FAQ and additional help resources coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
