import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold, Button, Link, ScreenHeader } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding';

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View
      className="bg-stone-200 mx-6 mb-2 h-2 overflow-hidden rounded-full"
      accessibilityRole="progressbar"
      accessibilityValue={{ now: percent, min: 0, max: 100 }}>
      <View className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </View>
  );
}

export default function OnboardingTerms() {
  const router = useRouter();
  const store = useOnboardingStore();
  const { termsAccepted, setTermsAccepted } = store;

  const onFinish = () => {
    const payload = {
      branch: store.branch,
      status: store.status,
      dd214Uploaded: store.dd214Uploaded,
      address: store.address,
      emergencyContact: store.emergencyContact,
      termsAccepted: store.termsAccepted,
    };
    // TODO: persist to Clerk user metadata (follow-up story).
    console.log('[onboarding] finish payload', payload);
    router.replace('/(auth)/onboarding/permissions-location');
  };

  return (
    <AuthScaffold
      header={
        <View>
          <ScreenHeader title="Step 4 of 4" />
          <ProgressBar percent={100} />
        </View>
      }
      footer={<Button label="Finish" disabled={!termsAccepted} onPress={onFinish} />}>
      <View>
        <Text className="text-title-1 text-foreground">Almost done</Text>
        <Text className="text-stone-600 mt-2 text-base">Please review and accept to finish.</Text>
      </View>

      <View className="mt-10">
        <Pressable
          onPress={() => setTermsAccepted(!termsAccepted)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
          accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
          className="min-h-[56px] flex-row items-start gap-3 rounded-xl bg-white p-4">
          <View
            className={`mt-0.5 h-7 w-7 items-center justify-center rounded-md border-[1.5px] ${
              termsAccepted ? 'border-primary bg-primary' : 'border-stone-400 bg-white'
            }`}>
            {termsAccepted ? <Ionicons name="checkmark" size={20} color="#FFFFFF" /> : null}
          </View>
          <View className="flex-1 flex-row flex-wrap items-center">
            <Text className="text-base text-foreground">I agree to the </Text>
            <Link label="Terms of Service" size="md" onPress={() => router.push('/legal/terms')} />
            <Text className="text-base text-foreground"> and </Text>
            <Link label="Privacy Policy" size="md" onPress={() => router.push('/legal/privacy')} />
            <Text className="text-base text-foreground">.</Text>
          </View>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}
