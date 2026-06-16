/**
 * OnboardingProgress — step progress indicator for the onboarding flow.
 *
 * Veteran Honor: a navy ({colors.primary}) fill on a calm hairline
 * ({colors.border-hairline}) track. Sits below the ScreenHeader in each step.
 * Behavior/semantics (accessibilityRole="progressbar") are unchanged from the
 * prior inline bars this consolidates.
 */

import { View } from 'react-native';

export type OnboardingProgressProps = {
  /** Completion of the flow, 0–100. */
  percent: number;
};

export function OnboardingProgress({ percent }: OnboardingProgressProps) {
  return (
    <View
      className="mx-6 mb-2 h-2 overflow-hidden rounded-full bg-border-hairline"
      accessibilityRole="progressbar"
      accessibilityValue={{ now: percent, min: 0, max: 100 }}>
      <View className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </View>
  );
}
