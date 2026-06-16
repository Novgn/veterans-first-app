/**
 * ComfortBadges component
 *
 * Displays comfort preference badges for riders:
 * - Temperature preference (cool, normal, warm)
 * - Conversation preference (quiet, some, chatty)
 * - Music preference (none, soft, any)
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

interface ComfortPrefs {
  comfortTemperature: string | null;
  conversationPreference: string | null;
  musicPreference: string | null;
}

interface ComfortBadgesProps {
  preferences: ComfortPrefs;
  testID?: string;
}

interface ComfortBadge {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

// Veteran Honor: comfort preferences are calm, matter-of-fact tags — stone pill,
// ink label, a single restrained ink-secondary icon tint. No rainbow sentiment
// colors. A hairline border (not brass) distinguishes them from the brass-edged
// accessibility/assistance badges.
const ICON_TINT = '#4F4A41'; // ink-secondary

const TEMPERATURE_CONFIG: Record<string, ComfortBadge> = {
  cool: { icon: 'snow', label: 'Cool' },
  normal: { icon: 'thermometer', label: 'Normal' },
  warm: { icon: 'sunny', label: 'Warm' },
};

const CONVERSATION_CONFIG: Record<string, ComfortBadge> = {
  quiet: { icon: 'volume-mute', label: 'Quiet' },
  some: { icon: 'chatbubbles', label: 'Some chat' },
  chatty: { icon: 'chatbox-ellipses', label: 'Chatty' },
};

const MUSIC_CONFIG: Record<string, ComfortBadge> = {
  none: { icon: 'musical-notes-outline', label: 'No music' },
  soft: { icon: 'musical-notes', label: 'Soft music' },
  any: { icon: 'volume-high', label: 'Any music' },
};

function ComfortBadgeItem({ badge }: { badge: ComfortBadge }) {
  return (
    <View
      className="border-hairline flex-row items-center rounded-full border bg-background px-3 py-1"
      accessibilityLabel={badge.label}>
      <Ionicons name={badge.icon} size={14} color={ICON_TINT} />
      <Text className="ml-1.5 font-sans-medium text-caption text-foreground">{badge.label}</Text>
    </View>
  );
}

export function ComfortBadges({ preferences, testID }: ComfortBadgesProps) {
  const badges: ComfortBadge[] = [];

  // Temperature preference
  if (preferences.comfortTemperature) {
    const tempBadge = TEMPERATURE_CONFIG[preferences.comfortTemperature];
    if (tempBadge) {
      badges.push(tempBadge);
    }
  }

  // Conversation preference
  if (preferences.conversationPreference) {
    const convBadge = CONVERSATION_CONFIG[preferences.conversationPreference];
    if (convBadge) {
      badges.push(convBadge);
    }
  }

  // Music preference
  if (preferences.musicPreference) {
    const musicBadge = MUSIC_CONFIG[preferences.musicPreference];
    if (musicBadge) {
      badges.push(musicBadge);
    }
  }

  if (badges.length === 0) {
    return (
      <Text testID={testID} className="font-sans text-caption text-ink-secondary">
        No comfort preferences set
      </Text>
    );
  }

  return (
    <View testID={testID} className="flex-row flex-wrap gap-2">
      {badges.map((badge, index) => (
        <ComfortBadgeItem key={`comfort-${index}`} badge={badge} />
      ))}
    </View>
  );
}
