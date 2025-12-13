/**
 * TimeSlot Component
 *
 * Individual time slot button for the time picker.
 * 56dp height for senior-friendly touch targets.
 *
 * @example
 * <TimeSlot time="9:00 AM" isSelected={false} onPress={() => {}} />
 */

import { Text, Pressable } from 'react-native';

interface TimeSlotProps {
  time: string;
  isSelected: boolean;
  onPress: () => void;
  isDisabled?: boolean;
}

export function TimeSlot({ time, isSelected, onPress, isDisabled = false }: TimeSlotProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`m-1 min-h-[56px] w-[30%] items-center justify-center rounded-xl ${
        isSelected ? 'bg-primary' : isDisabled ? 'bg-gray-100' : 'border border-gray-200 bg-white'
      } active:opacity-80`}
      accessibilityLabel={`Select ${time} for pickup`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}>
      <Text
        className={`text-lg font-semibold ${
          isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-foreground'
        }`}>
        {time}
      </Text>
    </Pressable>
  );
}
