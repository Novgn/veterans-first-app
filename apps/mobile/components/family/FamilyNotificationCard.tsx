// FamilyNotificationCard — pickup / arrival event card for the family experience.
//
// Renders a calm, white card on the stone canvas with a semantic status icon, a
// plain-language headline, and a timestamp. Safe-arrival events carry the arrival
// photo thumbnail — the trust proof family members are waiting for. Tap opens the
// full photo / event detail when `onPress` is provided.
//
// Per DESIGN.md {components.family-notification-card} + EXPERIENCE.md
// § Notifications & Cross-Surface Sync. Success/navy carry the cue; brass is
// never used as text here.
//
// Usage:
//   <FamilyNotificationCard
//     event="arrived"
//     riderName="Margaret"
//     photoUri={photo}
//     timestamp="Today at 2:14 PM"
//     onPress={openPhoto}
//   />

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

export type FamilyNotificationEvent = 'picked-up' | 'arrived';

export interface FamilyNotificationCardProps {
  /** The trip event this card reports. */
  event: FamilyNotificationEvent;
  /** Rider's first name / display name — the subject of the headline. */
  riderName: string;
  /** Driver's name, used in the picked-up headline ("{driver} picked up {rider}."). */
  driverName?: string;
  /** Arrival-photo URI — when present, renders the rounded thumbnail (trust proof). */
  photoUri?: string;
  /** Pre-formatted, human-readable timestamp (e.g. "Today at 2:14 PM"). */
  timestamp: string;
  /** When provided, the card becomes pressable (tap → full photo / detail). */
  onPress?: () => void;
  /** Optional testID forwarded to the root element. */
  testID?: string;
}

// arrived → safe-arrival success cue; picked-up → navy (trip-in-motion / trust).
// Color is never the sole signal — the headline always carries the meaning.
const EVENT_STYLES: Record<
  FamilyNotificationEvent,
  { icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  arrived: { icon: 'checkmark-circle', iconColor: '#356046' /* success */ },
  'picked-up': { icon: 'car', iconColor: '#1F3A5F' /* navy */ },
};

export function FamilyNotificationCard({
  event,
  riderName,
  driverName,
  photoUri,
  timestamp,
  onPress,
  testID,
}: FamilyNotificationCardProps) {
  const { icon, iconColor } = EVENT_STYLES[event];

  const headline =
    event === 'arrived'
      ? `${riderName} arrived safely.`
      : `${driverName ?? 'Your driver'} picked up ${riderName}.`;

  // Card surface: white on stone, rounded-lg, soft shadow, hairline boundary, 24px pad.
  const content = (
    <View
      className="border-hairline flex-row items-center rounded-lg border bg-card p-6 shadow-card"
      accessibilityRole={onPress ? undefined : 'text'}>
      <Ionicons name={icon} size={32} color={iconColor} />
      <View className="ml-4 flex-1">
        <Text className="font-sans-semibold text-headline text-ink">{headline}</Text>
        <Text className="mt-1 font-sans text-caption text-ink-secondary">{timestamp}</Text>
      </View>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          accessibilityIgnoresInvertColors
          className="ml-4 h-16 w-16 rounded-md"
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${headline} ${timestamp}`}
        className="active:opacity-90">
        {content}
      </Pressable>
    );
  }

  return (
    <View testID={testID} accessibilityLabel={`${headline} ${timestamp}`}>
      {content}
    </View>
  );
}
