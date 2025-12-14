/**
 * ConversationSelector Component
 *
 * Single-select picker for conversation preference.
 * Story 2.14: Implement Comfort Preferences (AC: #1, #4)
 *
 * Features:
 * - Three conversation options (Quiet, Some Chat, Chatty)
 * - Vertical list layout with icon badges
 * - Accessibility support (radio group pattern)
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { ConversationPreference } from '../hooks/useComfortPreferences';

interface ConversationOption {
  value: NonNullable<ConversationPreference>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const CONVERSATION_OPTIONS: ConversationOption[] = [
  {
    value: 'quiet',
    label: 'Quiet Ride',
    icon: 'volume-mute',
    description: 'Prefer minimal conversation',
  },
  {
    value: 'some',
    label: 'Some Chat',
    icon: 'chatbubble',
    description: 'Light conversation is nice',
  },
  {
    value: 'chatty',
    label: 'Chatty',
    icon: 'chatbubbles',
    description: 'Love a good conversation',
  },
];

interface ConversationSelectorProps {
  /** Currently selected conversation preference */
  value: ConversationPreference;
  /** Callback when selection changes */
  onChange: (value: ConversationPreference) => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * Conversation preference selector with list-style buttons.
 * Uses icons and descriptions for clarity.
 */
export function ConversationSelector({ value, onChange, testID }: ConversationSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Conversation</Text>
      <Text className="mb-4 text-sm text-gray-600">How much do you like to chat during rides?</Text>

      <View
        className="gap-2"
        accessibilityRole="radiogroup"
        accessibilityLabel="Select your conversation preference">
        {CONVERSATION_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`min-h-[56px] flex-row items-center rounded-xl px-4 ${
              value === option.value
                ? 'border-2 border-primary bg-primary/10'
                : 'border border-gray-200 bg-white'
            }`}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === option.value }}
            accessibilityHint={option.description}
            testID={testID ? `${testID}-option-${option.value}` : undefined}>
            <View
              className={`mr-4 h-10 w-10 items-center justify-center rounded-full ${
                value === option.value ? 'bg-primary' : 'bg-gray-100'
              }`}>
              <Ionicons
                name={option.icon}
                size={20}
                color={value === option.value ? '#FFFFFF' : '#6B7280'}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-medium ${
                  value === option.value ? 'text-primary' : 'text-foreground'
                }`}>
                {option.label}
              </Text>
              <Text className="text-sm text-gray-500">{option.description}</Text>
            </View>
            {value === option.value && (
              <Ionicons name="checkmark-circle" size={24} color="#1E40AF" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Export conversation options for testing */
export { CONVERSATION_OPTIONS };
