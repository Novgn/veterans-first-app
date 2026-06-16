/**
 * AccessibilityBadges component
 *
 * Displays icon badges for rider accessibility needs:
 * - Mobility aids (wheelchair, walker, cane)
 * - Door assistance
 * - Package assistance
 * - Extra vehicle space
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Veteran Honor accent — muted brass. NON-TEXT only: used for the badge border
// and icon. The label always renders in ink (text-foreground).
const BRASS = '#9A7B3F';

interface AccessibilityPrefs {
  mobilityAid: string | null;
  needsDoorAssistance: boolean;
  needsPackageAssistance: boolean;
  extraVehicleSpace: boolean;
}

interface AccessibilityBadgesProps {
  preferences: AccessibilityPrefs;
  size?: 'sm' | 'md';
  testID?: string;
}

// Map mobility aid types to icons
const MOBILITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cane: 'walk',
  walker: 'body',
  manual_wheelchair: 'accessibility',
  power_wheelchair: 'flash',
};

interface Badge {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

export function AccessibilityBadges({
  preferences,
  size = 'md',
  testID,
}: AccessibilityBadgesProps) {
  const iconSize = size === 'sm' ? 14 : 18;

  const badges: Badge[] = [];

  // Mobility aid badge
  if (preferences.mobilityAid && preferences.mobilityAid !== 'none') {
    badges.push({
      icon: MOBILITY_ICONS[preferences.mobilityAid] ?? 'accessibility',
      label: preferences.mobilityAid.replace(/_/g, ' '),
    });
  }

  // Door assistance badge
  if (preferences.needsDoorAssistance) {
    badges.push({
      icon: 'home',
      label: 'door assistance',
    });
  }

  // Package assistance badge
  if (preferences.needsPackageAssistance) {
    badges.push({
      icon: 'bag-handle',
      label: 'package help',
    });
  }

  // Extra space badge
  if (preferences.extraVehicleSpace) {
    badges.push({
      icon: 'resize',
      label: 'extra space',
    });
  }

  // Return null if no badges to show
  if (badges.length === 0) {
    return null;
  }

  // Veteran Honor assistance badge: stone pill, brass border + icon (non-text),
  // ink label. Dignified, matter-of-fact — never clinical, never red-flagged.
  const labelClass = size === 'sm' ? 'text-caption' : 'text-base';

  return (
    <View testID={testID} className="mt-1 flex-row flex-wrap gap-2">
      {badges.map((badge, index) => (
        <View
          key={`badge-${index}`}
          className="flex-row items-center rounded-full border border-brass bg-background px-3 py-1"
          accessibilityLabel={`Needs ${badge.label}`}>
          <Ionicons name={badge.icon} size={iconSize} color={BRASS} />
          <Text className={`ml-1.5 font-sans-medium capitalize text-foreground ${labelClass}`}>
            {badge.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
