import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Text, View } from 'react-native';

import { AuthScaffold, Button, ScreenHeader } from '@/components/ui';

export default function PrivacyScreen() {
  const router = useRouter();
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;

  return (
    <AuthScaffold
      header={<ScreenHeader title="Privacy Policy" />}
      footer={<Button label="Close" variant="ghost" onPress={() => router.back()} />}>
      <View className="items-center">
        {privacyUrl ? (
          <>
            <Text className="text-stone-600 text-center text-body">
              Our full Privacy Policy is available on our website.
            </Text>
            <View className="mt-6 w-full">
              <Button
                label="Open Privacy Policy"
                onPress={() => {
                  void WebBrowser.openBrowserAsync(privacyUrl);
                }}
              />
            </View>
          </>
        ) : (
          <Text className="text-stone-600 text-center text-body">
            Our Privacy Policy is being finalized. This placeholder is shown during development. We
            take your data seriously — see our policy for details once published.
          </Text>
        )}
      </View>
    </AuthScaffold>
  );
}
