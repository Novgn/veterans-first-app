import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useState } from 'react';

import { PermissionPrimer } from '@/components/permissions/PermissionPrimer';

export default function PermissionsLocationScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const goNext = () => {
    router.replace('/(auth)/onboarding/permissions-notifications');
  };

  const onContinue = async () => {
    setIsLoading(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch (err) {
      // If the permission request throws (e.g. unavailable on this platform),
      // swallow the error so onboarding can proceed.
      console.warn('[permissions-location] requestForegroundPermissionsAsync failed', err);
    } finally {
      setIsLoading(false);
      goNext();
    }
  };

  return (
    <PermissionPrimer
      iconName="location"
      title="Let us know where to pick you up"
      description="We use your location to find drivers nearby and give you accurate ETAs."
      bullets={[
        { iconName: 'car', text: 'Find drivers near you' },
        { iconName: 'time', text: 'Accurate pickup times' },
        { iconName: 'people', text: 'Share location with family for peace of mind' },
      ]}
      continueLabel="Allow Location"
      onContinue={onContinue}
      skipLabel="Not now"
      onSkip={goNext}
      isLoading={isLoading}
    />
  );
}
