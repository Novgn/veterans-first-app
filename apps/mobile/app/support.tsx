import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold, ScreenHeader } from '@/components/ui';

const SUPPORT_PHONE_FALLBACK = '1-800-555-0199';
const SUPPORT_EMAIL_FALLBACK = 'support@veteransfirst.app';

export default function SupportScreen() {
  const phone = process.env.EXPO_PUBLIC_SUPPORT_PHONE || SUPPORT_PHONE_FALLBACK;
  const email = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || SUPPORT_EMAIL_FALLBACK;

  const onCall = () => {
    const digits = phone.replace(/[^0-9+]/g, '');
    void Linking.openURL(`tel:${digits}`);
  };

  const onEmail = () => {
    void Linking.openURL(`mailto:${email}`);
  };

  return (
    <AuthScaffold header={<ScreenHeader title="Contact support" />}>
      <View>
        <Text className="text-title-1 text-foreground">We&apos;re here to help</Text>
        <Text className="text-stone-600 mt-3 text-body">
          Our team is available 7 days a week to help veterans and their families. Reach out by
          phone or email and we&apos;ll get back to you quickly.
        </Text>
      </View>

      <View className="mt-8 gap-3">
        <Pressable
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel={`Call support at ${phone}`}
          className="flex-row items-center gap-4 rounded-xl bg-white p-4 active:opacity-80">
          <Ionicons name="call" size={32} color="#1E40AF" />
          <View className="flex-1">
            <Text className="text-callout font-semibold text-foreground">Call us</Text>
            <Text className="text-stone-500 mt-1 text-footnote">{phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#78716C" />
        </Pressable>

        <Pressable
          onPress={onEmail}
          accessibilityRole="button"
          accessibilityLabel={`Email support at ${email}`}
          className="flex-row items-center gap-4 rounded-xl bg-white p-4 active:opacity-80">
          <Ionicons name="mail" size={32} color="#1E40AF" />
          <View className="flex-1">
            <Text className="text-callout font-semibold text-foreground">Email us</Text>
            <Text className="text-stone-500 mt-1 text-footnote">{email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#78716C" />
        </Pressable>
      </View>

      <View className="mt-8 items-center">
        <Text className="text-stone-500 text-footnote">Available 7 days a week.</Text>
      </View>
    </AuthScaffold>
  );
}
