import { useRouter } from 'expo-router';

import { EdgeStateScreen } from '@/components/edge/EdgeStateScreen';

export default function OfflineScreen() {
  const router = useRouter();

  return (
    <EdgeStateScreen
      iconName="cloud-offline-outline"
      iconTone="warning"
      title="You're offline"
      description="Check your connection and try again. Your rides and account are safe."
      primaryAction={{
        label: 'Try again',
        onPress: async () => {
          router.back();
        },
      }}
    />
  );
}
