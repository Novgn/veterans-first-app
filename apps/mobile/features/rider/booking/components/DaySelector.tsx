/**
 * DaySelector Component
 *
 * Day-of-week checkboxes for custom recurring ride schedules.
 * Allows selecting specific days (Mon-Fri, etc.).
 *
 * @example
 * <DaySelector selectedDays={['mon', 'wed', 'fri']} onSelect={setDays} />
 */

import { View, Text, Pressable } from 'react-native';

interface DaySelectorProps {
  selectedDays: string[];
  onSelect: (days: string[]) => void;
  className?: string;
}

const DAYS: { value: string; label: string; short: string }[] = [
  { value: 'mon', label: 'Monday', short: 'Mon' },
  { value: 'tue', label: 'Tuesday', short: 'Tue' },
  { value: 'wed', label: 'Wednesday', short: 'Wed' },
  { value: 'thu', label: 'Thursday', short: 'Thu' },
  { value: 'fri', label: 'Friday', short: 'Fri' },
  { value: 'sat', label: 'Saturday', short: 'Sat' },
  { value: 'sun', label: 'Sunday', short: 'Sun' },
];

export function DaySelector({ selectedDays, onSelect, className }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onSelect(selectedDays.filter((d) => d !== day));
    } else {
      onSelect([...selectedDays, day]);
    }
  };

  return (
    <View className={className}>
      <Text className="mb-3 text-base font-medium text-gray-700">Which days?</Text>
      <View className="flex-row flex-wrap">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <Pressable
              key={day.value}
              onPress={() => toggleDay(day.value)}
              className={`mb-2 mr-2 min-h-[48px] min-w-[48px] items-center justify-center rounded-xl px-3 ${
                isSelected ? 'bg-primary' : 'border border-gray-200 bg-white'
              }`}
              accessibilityLabel={`${day.label}${isSelected ? ', selected' : ''}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}>
              <Text
                className={`text-base font-semibold ${
                  isSelected ? 'text-white' : 'text-foreground'
                }`}>
                {day.short}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
