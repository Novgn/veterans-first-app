import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Text, View } from 'react-native';

import { AuthScaffold, Button, ScreenHeader } from '@/components/ui';

export default function TermsScreen() {
  const router = useRouter();
  const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL;

  return (
    <AuthScaffold
      header={<ScreenHeader title="Terms of Service" />}
      footer={<Button label="Close" variant="ghost" onPress={() => router.back()} />}>
      <View className="items-center">
        {termsUrl ? (
          <>
            <Text className="text-stone-600 text-center text-body">
              Our full Terms of Service is available on our website.
            </Text>
            <View className="mt-6 w-full">
              <Button
                label="Open Terms"
                onPress={() => {
                  void WebBrowser.openBrowserAsync(termsUrl);
                }}
              />
            </View>
          </>
        ) : (
          <Text className="text-stone-600 text-center text-body">
            Our Terms of Service is being finalized. This placeholder is shown during development.
            Questions? Contact support.
          </Text>
        )}
      </View>
    </AuthScaffold>
  );
}
