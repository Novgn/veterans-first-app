import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { AuthScaffold, Button, ScreenHeader, TextField } from '@/components/ui';
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

export default function OnboardingAddress() {
  const router = useRouter();
  const { address, setAddress } = useOnboardingStore();

  const canContinue =
    address.street.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length === 2 &&
    address.zip.trim().length === 5;

  return (
    <AuthScaffold
      header={
        <View>
          <ScreenHeader title="Step 2 of 4" />
          <ProgressBar percent={50} />
        </View>
      }
      footer={
        <Button
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(auth)/onboarding/emergency-contact')}
        />
      }>
      <View>
        <Text className="text-title-1 text-foreground">Your home address</Text>
        <Text className="text-stone-600 mt-2 text-body">
          We&apos;ll use this as your default pickup.
        </Text>
      </View>

      <View className="mt-8 gap-5">
        <TextField
          label="Street"
          value={address.street}
          onChangeText={(street) => setAddress({ street })}
          placeholder="123 Main St"
          autoComplete="street-address"
          autoCapitalize="words"
        />
        <TextField
          label="City"
          value={address.city}
          onChangeText={(city) => setAddress({ city })}
          placeholder="Springfield"
          autoComplete="postal-address-locality"
          autoCapitalize="words"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="State"
              value={address.state}
              onChangeText={(state) => setAddress({ state: state.toUpperCase() })}
              placeholder="CA"
              autoCapitalize="characters"
              autoComplete="postal-address-region"
              maxLength={2}
            />
          </View>
          <View className="flex-1">
            <TextField
              label="ZIP"
              value={address.zip}
              onChangeText={(zip) => setAddress({ zip: zip.replace(/\D/g, '') })}
              placeholder="12345"
              keyboardType="number-pad"
              autoComplete="postal-code"
              maxLength={5}
            />
          </View>
        </View>
      </View>
    </AuthScaffold>
  );
}
