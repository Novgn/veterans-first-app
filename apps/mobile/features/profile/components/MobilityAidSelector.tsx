/**
 * MobilityAidSelector Component
 *
 * Single-select picker for mobility aid types.
 * Story 2.13: Implement Accessibility Preferences (AC: #1, #4)
 *
 * Features:
 * - Five mobility aid options with icons
 * - Single selection behavior
 * - Accessibility support (radio group pattern)
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { MobilityAidType } from '../hooks/useAccessibilityPreferences';

interface MobilityAidOption {
  value: MobilityAidType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const MOBILITY_OPTIONS: MobilityAidOption[] = [
  { value: 'none', label: 'None', icon: 'walk', description: 'No mobility aid needed' },
  { value: 'cane', label: 'Cane', icon: 'fitness', description: 'Uses a walking cane' },
  { value: 'walker', label: 'Walker', icon: 'body', description: 'Uses a walker or rollator' },
  {
    value: 'manual_wheelchair',
    label: 'Manual Wheelchair',
    icon: 'accessibility',
    description: 'Uses a manual wheelchair',
  },
  {
    value: 'power_wheelchair',
    label: 'Power Wheelchair',
    icon: 'flash',
    description: 'Uses a motorized wheelchair',
  },
];

interface MobilityAidSelectorProps {
  /** Currently selected mobility aid */
  value: MobilityAidType;
  /** Callback when selection changes */
  onChange: (value: MobilityAidType) => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * Mobility aid selector with radio-button style selection.
 * Uses icons and descriptions for accessibility.
 */
export function MobilityAidSelector({ value, onChange, testID }: MobilityAidSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Mobility Aid</Text>
      <Text className="mb-4 text-sm text-gray-600">
        Select the mobility aid you use, if any. This helps drivers prepare for your ride.
      </Text>

      <View
        className="gap-2"
        accessibilityRole="radiogroup"
        accessibilityLabel="Select your mobility aid type">
        {MOBILITY_OPTIONS.map((option) => (
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
                size={24}
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

/** Export mobility options for testing */
export { MOBILITY_OPTIONS };
