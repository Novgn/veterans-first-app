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
import { View } from 'react-native';

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
  color: string;
  label: string;
}

export function AccessibilityBadges({
  preferences,
  size = 'md',
  testID,
}: AccessibilityBadgesProps) {
  const iconSize = size === 'sm' ? 14 : 18;
  const badgeSize = size === 'sm' ? 24 : 32;

  const badges: Badge[] = [];

  // Mobility aid badge
  if (preferences.mobilityAid && preferences.mobilityAid !== 'none') {
    badges.push({
      icon: MOBILITY_ICONS[preferences.mobilityAid] ?? 'accessibility',
      color: '#7C3AED',
      label: preferences.mobilityAid.replace(/_/g, ' '),
    });
  }

  // Door assistance badge
  if (preferences.needsDoorAssistance) {
    badges.push({
      icon: 'home',
      color: '#1E40AF',
      label: 'door assistance',
    });
  }

  // Package assistance badge
  if (preferences.needsPackageAssistance) {
    badges.push({
      icon: 'bag-handle',
      color: '#059669',
      label: 'package help',
    });
  }

  // Extra space badge
  if (preferences.extraVehicleSpace) {
    badges.push({
      icon: 'resize',
      color: '#F59E0B',
      label: 'extra space',
    });
  }

  // Return null if no badges to show
  if (badges.length === 0) {
    return null;
  }

  return (
    <View testID={testID} className="mt-1 flex-row gap-1">
      {badges.map((badge, index) => (
        <View
          key={`badge-${index}`}
          style={{
            width: badgeSize,
            height: badgeSize,
            backgroundColor: `${badge.color}20`,
          }}
          className="items-center justify-center rounded-full"
          accessibilityLabel={`Needs ${badge.label}`}>
          <Ionicons name={badge.icon} size={iconSize} color={badge.color} />
        </View>
      ))}
    </View>
  );
}
