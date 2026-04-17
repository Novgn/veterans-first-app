/**
 * FrequencySelector Component
 *
 * Allows users to select recurring ride frequency: Daily, Weekly, or Custom days.
 *
 * @example
 * <FrequencySelector selectedFrequency="weekly" onSelect={setFrequency} />
 */

import { View, Text, Pressable } from 'react-native';

export type RecurringFrequency = 'daily' | 'weekly' | 'custom' | null;

interface FrequencySelectorProps {
  selectedFrequency: RecurringFrequency;
  onSelect: (frequency: RecurringFrequency) => void;
  className?: string;
}

const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week' },
  { value: 'custom', label: 'Custom', description: 'Specific days' },
];

export function FrequencySelector({
  selectedFrequency,
  onSelect,
  className,
}: FrequencySelectorProps) {
  return (
    <View className={className}>
      <Text className="mb-3 text-base font-medium text-gray-700">How often?</Text>
      <View className="flex-row">
        {FREQUENCY_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            className={`mr-2 min-h-[48px] flex-1 items-center justify-center rounded-xl px-2 ${
              selectedFrequency === option.value ? 'bg-primary' : 'border border-gray-200 bg-white'
            }`}
            accessibilityLabel={`${option.label}: ${option.description}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedFrequency === option.value }}>
            <Text
              className={`text-base font-semibold ${
                selectedFrequency === option.value ? 'text-white' : 'text-foreground'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
