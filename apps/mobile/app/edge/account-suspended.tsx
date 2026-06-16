import { useClerk } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { EdgeStateScreen } from '@/components/edge/EdgeStateScreen';

const SUPPORT_PHONE_FALLBACK = '18005550199';
const HAS_SEEN_WELCOME_KEY = 'veteransfirst.hasSeenWelcome';

export default function AccountSuspendedScreen() {
  const { signOut } = useClerk();
  const router = useRouter();

  const supportPhone =
    process.env.EXPO_PUBLIC_SUPPORT_PHONE?.replace(/\D/g, '') ?? SUPPORT_PHONE_FALLBACK;

  return (
    <EdgeStateScreen
      iconName="lock-closed-outline"
      iconTone="error"
      title="Your account is on hold"
      description="Please contact Veterans First support to resolve this. We're here to help."
      primaryAction={{
        label: 'Call support',
        onPress: () => {
          void Linking.openURL(`tel:${supportPhone}`);
        },
      }}
      secondaryAction={{
        label: 'Sign out',
        onPress: async () => {
          await signOut();
          await AsyncStorage.removeItem(HAS_SEEN_WELCOME_KEY).catch(() => {});
          router.replace('/(auth)/welcome');
        },
      }}
    />
  );
}
