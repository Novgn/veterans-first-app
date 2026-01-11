import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';

export type DriverStatus = 'available' | 'on_trip' | 'offline';

interface StatusOption {
  value: DriverStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeColor: string;
  activeBgColor: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'available',
    label: 'Available',
    icon: 'checkmark-circle',
    activeColor: '#059669',
    activeBgColor: '#D1FAE5',
  },
  {
    value: 'on_trip',
    label: 'On Trip',
    icon: 'car',
    activeColor: '#1E40AF',
    activeBgColor: '#DBEAFE',
  },
  {
    value: 'offline',
    label: 'Offline',
    icon: 'moon',
    activeColor: '#6B7280',
    activeBgColor: '#F3F4F6',
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
    <View testID={testID} className="rounded-xl bg-white p-4 shadow-sm">
      <Text className="mb-3 text-sm font-medium text-gray-500">Your Status</Text>

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
              className={`min-h-[56px] flex-1 flex-row items-center justify-center rounded-xl border-2 px-3 py-2 ${
                isSelected ? '' : 'border-gray-200 bg-white'
              } ${disabled ? 'opacity-50' : ''}`}
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityHint={`Set your status to ${option.label}`}
              testID={`status-option-${option.value}`}>
              <Ionicons
                name={option.icon}
                size={20}
                color={isSelected ? option.activeColor : '#9CA3AF'}
              />
              <Text
                style={[isSelected && { color: option.activeColor }]}
                className={`ml-2 text-sm font-semibold ${isSelected ? '' : 'text-gray-500'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
