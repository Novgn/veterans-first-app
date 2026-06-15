import { useRouter } from 'expo-router';
import { useState } from 'react';

import { PermissionPrimer } from '@/components/permissions/PermissionPrimer';

export default function PermissionsNotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const finishOnboarding = () => {
    router.replace('/');
  };

  const onContinue = async () => {
    setIsLoading(true);
    try {
      // TODO: install expo-notifications and call
      // Notifications.requestPermissionsAsync() here.
      console.info('[permissions-notifications] stub: expo-notifications not installed yet');
    } finally {
      setIsLoading(false);
      finishOnboarding();
    }
  };

  return (
    <PermissionPrimer
      iconName="notifications"
      title="Stay informed about your rides"
      description="Notifications keep you updated when your driver is on the way or if plans change."
      bullets={[
        { iconName: 'car-sport', text: 'Driver arrival alerts' },
        { iconName: 'calendar', text: 'Upcoming ride reminders' },
        { iconName: 'alert-circle', text: 'Important changes to your trip' },
      ]}
      continueLabel="Allow Notifications"
      onContinue={onContinue}
      skipLabel="Not now"
      onSkip={finishOnboarding}
      isLoading={isLoading}
    />
  );
}
