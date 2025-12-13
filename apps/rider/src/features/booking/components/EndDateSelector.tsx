/**
 * EndDateSelector Component
 *
 * Allows users to set an end date for recurring rides or choose "Ongoing".
 * Senior-friendly with large touch targets and clear labeling.
 *
 * Features:
 * - "Ongoing" toggle option (no end date)
 * - Date picker for specific end date
 * - 14-day selection range from current date
 * - 48dp+ touch targets
 * - Full accessibility support
 *
 * Story 2.4: 3-Tap Booking Flow - Time Selection (Tap 2)
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface EndDateSelectorProps {
  /** Currently selected end date (YYYY-MM-DD) or null for ongoing */
  endDate: string | null;
  /** Callback when end date changes */
  onEndDateChange: (date: string | null) => void;
  /** Additional NativeWind classes */
  className?: string;
}

/**
 * Get date string in YYYY-MM-DD format
 */
const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0] as string;
};

/**
 * Get a human-readable label for a date
 */
const getDateLabel = (date: string): string => {
  const dateObj = new Date(date + 'T00:00:00');
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Generate date options starting from tomorrow for 30 days
 */
const generateEndDateOptions = (): { date: string; label: string }[] => {
  const options: { date: string; label: string }[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = getDateString(date);
    options.push({
      date: dateStr,
      label: getDateLabel(dateStr),
    });
  }

  return options;
};

export function EndDateSelector({ endDate, onEndDateChange, className }: EndDateSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isOngoing = endDate === null;
  const dateOptions = generateEndDateOptions();

  const handleOngoingToggle = () => {
    onEndDateChange(null);
  };

  const handleSelectEndDate = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = (date: string) => {
    onEndDateChange(date);
    setShowDatePicker(false);
  };

  return (
    <View className={className}>
      <Text className="mb-3 text-base font-medium text-gray-700">Until when?</Text>
      <View className="flex-row">
        {/* Ongoing Button */}
        <Pressable
          onPress={handleOngoingToggle}
          className={`mr-3 min-h-[48px] flex-1 items-center justify-center rounded-xl ${
            isOngoing ? 'bg-primary' : 'border border-gray-200 bg-white'
          }`}
          accessibilityLabel="Set recurring ride as ongoing with no end date"
          accessibilityRole="button"
          accessibilityState={{ selected: isOngoing }}>
          <Text
            className={`text-base font-semibold ${isOngoing ? 'text-white' : 'text-foreground'}`}>
            Ongoing
          </Text>
        </Pressable>

        {/* End Date Button */}
        <Pressable
          onPress={handleSelectEndDate}
          className={`min-h-[48px] flex-1 flex-row items-center justify-center rounded-xl ${
            !isOngoing ? 'bg-primary' : 'border border-gray-200 bg-white'
          }`}
          accessibilityLabel={
            endDate ? `End date: ${getDateLabel(endDate)}` : 'Select an end date for recurring ride'
          }
          accessibilityRole="button"
          accessibilityState={{ selected: !isOngoing }}>
          <Ionicons name="calendar-outline" size={18} color={!isOngoing ? '#FFFFFF' : '#6B7280'} />
          <Text
            className={`ml-2 text-base font-semibold ${!isOngoing ? 'text-white' : 'text-foreground'}`}>
            {endDate ? getDateLabel(endDate) : 'End Date'}
          </Text>
        </Pressable>
      </View>

      {/* End Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowDatePicker(false)}>
          <Pressable className="rounded-t-3xl bg-white pb-8" onPress={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
              <Text className="text-xl font-bold text-foreground">Select End Date</Text>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="min-h-[48px] min-w-[48px] items-center justify-center"
                accessibilityLabel="Close end date picker"
                accessibilityRole="button">
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Date Options */}
            <View className="max-h-96 px-4 pt-4">
              {dateOptions.slice(0, 14).map((option) => (
                <Pressable
                  key={option.date}
                  onPress={() => handleDateSelect(option.date)}
                  className={`mb-2 min-h-[56px] flex-row items-center justify-between rounded-xl px-4 ${
                    endDate === option.date ? 'bg-primary' : 'border border-gray-200 bg-white'
                  }`}
                  accessibilityLabel={`Select ${option.label} as end date`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: endDate === option.date }}>
                  <Text
                    className={`text-lg font-semibold ${
                      endDate === option.date ? 'text-white' : 'text-foreground'
                    }`}>
                    {option.label}
                  </Text>
                  {endDate === option.date && (
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
