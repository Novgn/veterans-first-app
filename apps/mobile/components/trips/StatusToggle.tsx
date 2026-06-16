import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

export type DriverStatus = 'available' | 'on_trip' | 'offline';

interface StatusOption {
  value: DriverStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Veteran Honor fill + border when this status is active. */
  activeColor: string;
  activeBgColor: string;
}

// Veteran Honor mapping: Available = sage (supportive/availability), On Trip =
// navy (active/authoritative), Offline = neutral ink on stone. Color is never
// the sole signal — each option carries an icon + label as well.
const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'available',
    label: 'Available',
    icon: 'checkmark-circle',
    activeColor: '#4A6B54', // sage
    activeBgColor: '#E3EAE3', // sage100
  },
  {
    value: 'on_trip',
    label: 'On Trip',
    icon: 'car',
    activeColor: '#1F3A5F', // navy
    activeBgColor: '#E4E9F0', // navy100
  },
  {
    value: 'offline',
    label: 'Offline',
    icon: 'moon',
    activeColor: '#4F4A41', // ink-secondary
    activeBgColor: '#F4F1EA', // stone
  },
];

interface StatusToggleProps {
  value: DriverStatus;
  onChange: (status: DriverStatus) => void;
  disabled?: boolean;
  testID?: string;
}

export function StatusToggle({ value, onChange, disabled = false, testID }: StatusToggleProps) {
  return (
    <View testID={testID} className="border-hairline rounded-lg border bg-card p-4 shadow-card">
      <Text className="mb-3 font-sans-medium text-caption text-ink-secondary">Your Status</Text>

      <View className="flex-row gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => !disabled && onChange(option.value)}
              disabled={disabled}
              style={[
                isSelected && {
                  backgroundColor: option.activeBgColor,
                  borderColor: option.activeColor,
                },
              ]}
              className={`min-h-touch-lg flex-1 flex-row items-center justify-center rounded-md border px-3 py-2 ${
                isSelected ? '' : 'border-hairline bg-card'
              } ${disabled ? 'opacity-50' : ''}`}
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityHint={`Set your status to ${option.label}`}
              testID={`status-option-${option.value}`}>
              <Ionicons
                name={option.icon}
                size={20}
                color={isSelected ? option.activeColor : '#6E685E'}
              />
              <Text
                style={[isSelected && { color: option.activeColor }]}
                className={`ml-2 font-sans-semibold text-caption ${
                  isSelected ? '' : 'text-ink-secondary'
                }`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
