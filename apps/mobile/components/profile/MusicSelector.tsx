/**
 * MusicSelector Component
 *
 * Single-select picker for music preference.
 * Story 2.14: Implement Comfort Preferences (AC: #1, #4)
 *
 * Features:
 * - Three music options (No Music, Soft Background, Any Music)
 * - Horizontal layout with card-style buttons
 * - Accessibility support (radio group pattern)
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { MusicPreference } from '@/hooks/useComfortPreferences';

interface MusicOption {
  value: NonNullable<MusicPreference>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const MUSIC_OPTIONS: MusicOption[] = [
  {
    value: 'none',
    label: 'No Music',
    icon: 'volume-off',
    description: 'Prefer silence',
  },
  {
    value: 'soft',
    label: 'Soft Background',
    icon: 'musical-note',
    description: 'Quiet, ambient music',
  },
  {
    value: 'any',
    label: 'Any Music',
    icon: 'musical-notes',
    description: 'Fine with any music',
  },
];

interface MusicSelectorProps {
  /** Currently selected music preference */
  value: MusicPreference;
  /** Callback when selection changes */
  onChange: (value: MusicPreference) => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * Music preference selector with card-style buttons.
 * Uses icons to represent music levels.
 */
export function MusicSelector({ value, onChange, testID }: MusicSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Music</Text>
      <Text className="mb-4 text-sm text-gray-600">
        What&apos;s your music preference for rides?
      </Text>

      <View
        className="flex-row gap-3"
        accessibilityRole="radiogroup"
        accessibilityLabel="Select your music preference">
        {MUSIC_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`min-h-[80px] flex-1 items-center justify-center rounded-xl px-2 py-3 ${
              value === option.value
                ? 'border-2 border-primary bg-primary/10'
                : 'border border-gray-200 bg-white'
            }`}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === option.value }}
            accessibilityHint={option.description}
            testID={testID ? `${testID}-option-${option.value}` : undefined}>
            <Ionicons
              name={option.icon}
              size={28}
              color={value === option.value ? '#1E40AF' : '#6B7280'}
            />
            <Text
              className={`mt-2 text-center text-sm font-medium ${
                value === option.value ? 'text-primary' : 'text-foreground'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Export music options for testing */
export { MUSIC_OPTIONS };
