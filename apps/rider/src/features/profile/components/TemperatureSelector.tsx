/**
 * TemperatureSelector Component
 *
 * Single-select picker for temperature preference.
 * Story 2.14: Implement Comfort Preferences (AC: #1, #4)
 *
 * Features:
 * - Three temperature options with icons (Cool, Normal, Warm)
 * - Horizontal layout with card-style buttons
 * - Accessibility support (radio group pattern)
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

import type { TemperaturePreference } from '../hooks/useComfortPreferences';

interface TemperatureOption {
  value: NonNullable<TemperaturePreference>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

const TEMPERATURE_OPTIONS: TemperatureOption[] = [
  {
    value: 'cool',
    label: 'Cool',
    icon: 'snow',
    description: 'Prefer cooler temperature',
    color: '#3B82F6',
  },
  {
    value: 'normal',
    label: 'Normal',
    icon: 'thermometer',
    description: 'Regular temperature is fine',
    color: '#10B981',
  },
  {
    value: 'warm',
    label: 'Warm',
    icon: 'sunny',
    description: 'Prefer warmer temperature',
    color: '#F59E0B',
  },
];

interface TemperatureSelectorProps {
  /** Currently selected temperature preference */
  value: TemperaturePreference;
  /** Callback when selection changes */
  onChange: (value: TemperaturePreference) => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * Temperature preference selector with card-style buttons.
 * Uses icons and colors to represent temperature levels.
 */
export function TemperatureSelector({ value, onChange, testID }: TemperatureSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Temperature</Text>
      <Text className="mb-4 text-sm text-gray-600">
        What temperature do you prefer during your rides?
      </Text>

      <View
        className="flex-row gap-3"
        accessibilityRole="radiogroup"
        accessibilityLabel="Select your temperature preference">
        {TEMPERATURE_OPTIONS.map((option) => (
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
              color={value === option.value ? '#1E40AF' : option.color}
            />
            <Text
              className={`mt-2 text-sm font-medium ${
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

/** Export temperature options for testing */
export { TEMPERATURE_OPTIONS };
