/**
 * StatusActionButton — the one big button that drives trip progression (Story 3.4)
 *
 * Label and color change based on the current ride status. Null return for
 * 'completed' (no further action). Haptic feedback on press.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import type { RideStatus } from '@/hooks/useTripStatus';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface StatusConfig {
  label: string;
  icon: IconName;
  nextStatus: RideStatus;
}

// Veteran Honor: this is the screen's single primary action at every stage of
// the lifecycle, so it always renders as the navy primary CTA (one primary
// action per screen). The label + icon carry the state, not the color.
const STATUS_CONFIG: Record<Exclude<RideStatus, 'completed'>, StatusConfig> = {
  assigned: {
    label: 'Start Route',
    icon: 'navigate',
    nextStatus: 'en_route',
  },
  en_route: {
    label: 'Arrived at Pickup',
    icon: 'location',
    nextStatus: 'arrived',
  },
  arrived: {
    label: 'Start Trip',
    icon: 'car',
    nextStatus: 'in_progress',
  },
  in_progress: {
    label: 'Complete Trip',
    icon: 'checkmark-circle',
    nextStatus: 'completed',
  },
};

export interface StatusActionButtonProps {
  currentStatus: RideStatus;
  onPress: (nextStatus: RideStatus) => void;
  isLoading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function StatusActionButton({
  currentStatus,
  onPress,
  isLoading = false,
  disabled = false,
  testID,
}: StatusActionButtonProps) {
  if (currentStatus === 'completed') return null;

  const config = STATUS_CONFIG[currentStatus];
  const isDisabled = disabled || isLoading;

  const handlePress = () => {
    // Haptics is best-effort; fire-and-forget so the action is not blocked
    // by unsupported platforms (web, tests) or permission failures.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress(config.nextStatus);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={`min-h-touch-lg flex-row items-center justify-center rounded-md bg-primary ${
        isDisabled ? 'opacity-50' : ''
      }`}
      accessibilityLabel={config.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      testID={testID}>
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name={config.icon} size={24} color="#FFFFFF" />
          <Text className="ml-2 font-sans-semibold text-headline text-white">{config.label}</Text>
        </>
      )}
    </Pressable>
  );
}
