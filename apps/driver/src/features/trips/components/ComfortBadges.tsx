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
  color: string;
}

const TEMPERATURE_CONFIG: Record<string, ComfortBadge> = {
  cool: { icon: 'snow', label: 'Cool', color: '#0EA5E9' },
  normal: { icon: 'thermometer', label: 'Normal', color: '#6B7280' },
  warm: { icon: 'sunny', label: 'Warm', color: '#F97316' },
};

const CONVERSATION_CONFIG: Record<string, ComfortBadge> = {
  quiet: { icon: 'volume-mute', label: 'Quiet', color: '#6B7280' },
  some: { icon: 'chatbubbles', label: 'Some chat', color: '#8B5CF6' },
  chatty: { icon: 'chatbox-ellipses', label: 'Chatty', color: '#10B981' },
};

const MUSIC_CONFIG: Record<string, ComfortBadge> = {
  none: { icon: 'musical-notes-outline', label: 'No music', color: '#6B7280' },
  soft: { icon: 'musical-notes', label: 'Soft music', color: '#3B82F6' },
  any: { icon: 'volume-high', label: 'Any music', color: '#EC4899' },
};

function ComfortBadgeItem({ badge }: { badge: ComfortBadge }) {
  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1"
      style={{ backgroundColor: `${badge.color}20` }}
      accessibilityLabel={badge.label}>
      <Ionicons name={badge.icon} size={14} color={badge.color} />
      <Text className="ml-1 text-xs font-medium" style={{ color: badge.color }}>
        {badge.label}
      </Text>
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
      <Text testID={testID} className="text-sm text-gray-500">
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
