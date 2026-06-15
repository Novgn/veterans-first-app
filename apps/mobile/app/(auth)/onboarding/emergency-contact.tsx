import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScaffold, Button, PhoneField, ScreenHeader, TextField } from '@/components/ui';
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

export default function OnboardingEmergencyContact() {
  const router = useRouter();
  const { emergencyContact, setEmergencyContact } = useOnboardingStore();

  const canContinue =
    emergencyContact.fullName.trim().length > 0 &&
    emergencyContact.relationship.trim().length > 0 &&
    emergencyContact.phone.replace(/\D/g, '').length === 10;

  return (
    <AuthScaffold
      header={
        <View>
          <ScreenHeader title="Step 3 of 4" />
          <ProgressBar percent={75} />
        </View>
      }
      footer={
        <Button
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(auth)/onboarding/terms')}
        />
      }>
      <View>
        <Text className="text-title-1 text-foreground">Emergency contact</Text>
        <Text className="text-stone-600 mt-2 text-body">
          In case of an issue during your ride, we&apos;ll contact this person.
        </Text>
      </View>

      <View className="mt-8 gap-5">
        <TextField
          label="Full name"
          value={emergencyContact.fullName}
          onChangeText={(fullName) => setEmergencyContact({ fullName })}
          placeholder="Jane Doe"
          autoComplete="name"
          autoCapitalize="words"
        />
        <TextField
          label="Relationship"
          value={emergencyContact.relationship}
          onChangeText={(relationship) => setEmergencyContact({ relationship })}
          placeholder="Son, Daughter, Spouse"
          autoCapitalize="words"
        />
        <PhoneField
          label="Phone number"
          value={emergencyContact.phone}
          onChangeText={(phone) => setEmergencyContact({ phone })}
        />
      </View>
    </AuthScaffold>
  );
}
