import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { EdgeStateScreen } from '@/components/edge/EdgeStateScreen';

// TODO: replace `id0` with the real App Store ID once the app is submitted.
const STORE_URL =
  Platform.OS === 'ios'
    ? 'itms-apps://itunes.apple.com/app/id0'
    : 'market://details?id=com.novagen.veteransfirst';

export default function UpdateRequiredScreen() {
  return (
    <EdgeStateScreen
      iconName="arrow-up-circle-outline"
      iconTone="primary"
      title="Update required"
      description="This version of Veterans First is no longer supported. Please update to continue."
      primaryAction={{
        label: 'Update now',
        onPress: () => {
          void Linking.openURL(STORE_URL);
        },
      }}
    />
  );
}
