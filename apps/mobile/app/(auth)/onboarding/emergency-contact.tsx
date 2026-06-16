import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { AuthScaffold, Button, PhoneField, ScreenHeader, TextField } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding';

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
          <OnboardingProgress percent={75} />
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
        <Text className="font-sans-bold text-title-1 text-foreground">Emergency contact</Text>
        <Text className="mt-2 font-sans text-body text-ink-secondary">
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
