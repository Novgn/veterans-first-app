/**
 * DateSelector Component
 *
 * Date selection with Today/Tomorrow quick-select and custom date option.
 * Senior-friendly with large touch targets.
 *
 * @example
 * <DateSelector selectedDate={date} onDateSelect={setDate} />
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface DateSelectorProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
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
  const today = getDateString(new Date());
  const tomorrow = getDateString(new Date(Date.now() + 86400000));

  if (date === today) return 'Today';
  if (date === tomorrow) return 'Tomorrow';

  // Format as "Mon, Dec 9"
  const dateObj = new Date(date + 'T00:00:00');
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Generate the next 14 days for the date picker modal
 */
const generateDateOptions = (): { date: string; label: string }[] => {
  const options: { date: string; label: string }[] = [];
  const todayDate = new Date();

  for (let i = 0; i < 14; i++) {
    const date = new Date(todayDate);
    date.setDate(todayDate.getDate() + i);
    const dateStr = getDateString(date);
    options.push({
      date: dateStr,
      label: getDateLabel(dateStr),
    });
  }

  return options;
};

export function DateSelector({ selectedDate, onDateSelect, className }: DateSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = getDateString(new Date());
  const tomorrow = getDateString(new Date(Date.now() + 86400000));
  const currentDate = selectedDate || today;
  const dateOptions = generateDateOptions();

  const handleCustomDateSelect = (date: string) => {
    onDateSelect(date);
    setShowDatePicker(false);
  };

  return (
    <View className={className}>
      <Text className="mb-3 text-lg font-semibold text-gray-700">When do you need to go?</Text>
      <View className="flex-row">
        {/* Today Button */}
        <Pressable
          onPress={() => onDateSelect(today)}
          className={`mr-3 min-h-[56px] flex-1 items-center justify-center rounded-xl ${
            currentDate === today ? 'bg-primary' : 'border border-gray-200 bg-white'
          }`}
          accessibilityLabel="Select today"
          accessibilityRole="button"
          accessibilityState={{ selected: currentDate === today }}>
          <Text
            className={`text-lg font-semibold ${
              currentDate === today ? 'text-white' : 'text-foreground'
            }`}>
            Today
          </Text>
        </Pressable>

        {/* Tomorrow Button */}
        <Pressable
          onPress={() => onDateSelect(tomorrow)}
          className={`mr-3 min-h-[56px] flex-1 items-center justify-center rounded-xl ${
            currentDate === tomorrow ? 'bg-primary' : 'border border-gray-200 bg-white'
          }`}
          accessibilityLabel="Select tomorrow"
          accessibilityRole="button"
          accessibilityState={{ selected: currentDate === tomorrow }}>
          <Text
            className={`text-lg font-semibold ${
              currentDate === tomorrow ? 'text-white' : 'text-foreground'
            }`}>
            Tomorrow
          </Text>
        </Pressable>

        {/* Custom Date Button */}
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className={`min-h-[56px] w-14 items-center justify-center rounded-xl border border-gray-200 bg-white ${
            currentDate !== today && currentDate !== tomorrow ? 'border-primary bg-primary/10' : ''
          }`}
          accessibilityLabel="Select a different date"
          accessibilityRole="button">
          <Ionicons
            name="calendar-outline"
            size={24}
            color={currentDate !== today && currentDate !== tomorrow ? '#10B981' : '#6B7280'}
          />
        </Pressable>
      </View>

      {/* Show selected date if not today or tomorrow */}
      {currentDate !== today && currentDate !== tomorrow && (
        <Text className="mt-2 text-center text-base text-gray-600">
          Selected: {getDateLabel(currentDate)}
        </Text>
      )}

      {/* Date Picker Modal */}
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
              <Text className="text-xl font-bold text-foreground">Select Date</Text>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="min-h-[48px] min-w-[48px] items-center justify-center"
                accessibilityLabel="Close date picker"
                accessibilityRole="button">
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Date Options */}
            <View className="px-4 pt-4">
              {dateOptions.map((option) => (
                <Pressable
                  key={option.date}
                  onPress={() => handleCustomDateSelect(option.date)}
                  className={`mb-2 min-h-[56px] flex-row items-center justify-between rounded-xl px-4 ${
                    currentDate === option.date ? 'bg-primary' : 'border border-gray-200 bg-white'
                  }`}
                  accessibilityLabel={`Select ${option.label}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: currentDate === option.date }}>
                  <Text
                    className={`text-lg font-semibold ${
                      currentDate === option.date ? 'text-white' : 'text-foreground'
                    }`}>
                    {option.label}
                  </Text>
                  {currentDate === option.date && (
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
