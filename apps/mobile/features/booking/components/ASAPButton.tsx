/**
 * ASAPButton Component
 *
 * Prominent "Schedule ASAP" option at the top of time selection.
 * Sets time to null indicating an immediate pickup request.
 *
 * @example
 * <ASAPButton onPress={handleASAP} isSelected={selectedTime === null} />
 */

import { Ionicons } from '@expo/vector-icons';
import { Text, Pressable } from 'react-native';

interface ASAPButtonProps {
  onPress: () => void;
  isSelected: boolean;
}

export function ASAPButton({ onPress, isSelected }: ASAPButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[56px] flex-row items-center justify-center rounded-xl ${
        isSelected ? 'bg-accent' : 'bg-accent/10'
      } px-6 active:opacity-80`}
      accessibilityLabel="Schedule ride as soon as possible"
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}>
      <Ionicons name="flash" size={24} color={isSelected ? '#FFFFFF' : '#D97706'} />
      <Text className={`ml-3 text-lg font-bold ${isSelected ? 'text-white' : 'text-accent'}`}>
        Schedule ASAP
      </Text>
    </Pressable>
  );
}
