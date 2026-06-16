import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { AuthScaffold, Button, ScreenHeader, SelectButton } from '@/components/ui';
import { useOnboardingStore, type ServiceBranch, type ServiceStatus } from '@/stores/onboarding';

const BRANCHES: ServiceBranch[] = [
  'Army',
  'Navy',
  'Marines',
  'Air Force',
  'Coast Guard',
  'Space Force',
];

const STATUSES: ServiceStatus[] = ['Active duty', 'Veteran', 'Reserve', 'Retired'];

export default function OnboardingVeteran() {
  const router = useRouter();
  const { branch, status, setBranch, setStatus } = useOnboardingStore();

  const canContinue = Boolean(branch && status);

  return (
    <AuthScaffold
      header={
        <View>
          <ScreenHeader title="Step 1 of 4" showBack={false} />
          <OnboardingProgress percent={25} />
        </View>
      }
      footer={
        <Button
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(auth)/onboarding/address')}
        />
      }>
      <View>
        <Text className="font-sans-bold text-title-1 text-foreground">
          Tell us about your service
        </Text>
        <Text className="mt-2 font-sans text-body text-ink-secondary">
          This helps us verify your eligibility. DD-214 upload is optional at this stage.
        </Text>
      </View>

      <View className="mt-8">
        <Text className="mb-3 font-sans-medium text-callout text-ink-secondary">
          Service branch
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {BRANCHES.map((b) => (
            <View key={b} className="w-[48%]">
              <SelectButton
                label={b}
                variant="filled"
                fullWidth
                selected={branch === b}
                onPress={() => setBranch(branch === b ? null : b)}
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <Text className="mb-3 font-sans-medium text-callout text-ink-secondary">
          Service status
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {STATUSES.map((s) => (
            <View key={s} className="w-[48%]">
              <SelectButton
                label={s}
                variant="filled"
                fullWidth
                selected={status === s}
                onPress={() => setStatus(status === s ? null : s)}
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        {/* TODO: Wire up DD-214 document upload (expo-document-picker + Supabase storage). */}
        <Button label="Upload DD-214 (optional)" variant="secondary" onPress={() => {}} />
      </View>
    </AuthScaffold>
  );
}
