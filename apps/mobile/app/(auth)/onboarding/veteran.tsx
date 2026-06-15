import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthScaffold, Button, ScreenHeader } from '@/components/ui';
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

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  const containerClass = selected ? 'bg-primary border-primary' : 'bg-white border-stone-300';
  const labelClass = selected ? 'text-white' : 'text-foreground';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={`min-h-[56px] items-center justify-center rounded-xl border-[1.5px] px-4 ${containerClass}`}>
      <Text className={`text-base font-semibold ${labelClass}`}>{label}</Text>
    </Pressable>
  );
}

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

export default function OnboardingVeteran() {
  const router = useRouter();
  const { branch, status, setBranch, setStatus } = useOnboardingStore();

  const canContinue = Boolean(branch && status);

  return (
    <AuthScaffold
      header={
        <View>
          <ScreenHeader title="Step 1 of 4" showBack={false} />
          <ProgressBar percent={25} />
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
        <Text className="text-title-1 text-foreground">Tell us about your service</Text>
        <Text className="text-stone-600 mt-2 text-body">
          This helps us verify your eligibility. DD-214 upload is optional at this stage.
        </Text>
      </View>

      <View className="mt-8">
        <Text className="text-stone-700 mb-3 text-base font-medium">Service branch</Text>
        <View className="flex-row flex-wrap gap-3">
          {BRANCHES.map((b) => (
            <View key={b} className="w-[48%]">
              <Chip
                label={b}
                selected={branch === b}
                onPress={() => setBranch(branch === b ? null : b)}
              />
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <Text className="text-stone-700 mb-3 text-base font-medium">Service status</Text>
        <View className="flex-row flex-wrap gap-3">
          {STATUSES.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={status === s}
              onPress={() => setStatus(status === s ? null : s)}
            />
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
