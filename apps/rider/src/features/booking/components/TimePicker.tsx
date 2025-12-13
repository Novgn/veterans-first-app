/**
 * TimePicker Component
 *
 * Main time selection UI for the booking flow.
 * Combines ASAP option, date selection, time slots, and recurring ride options.
 *
 * @example
 * <TimePicker onTimeSelect={(time) => advanceToNextStep()} />
 */

import { View, Text, ScrollView } from 'react-native';

import { ASAPButton } from './ASAPButton';
import { DateSelector } from './DateSelector';
import { RecurringFrequency } from './FrequencySelector';
import { RecurringRideToggle } from './RecurringRideToggle';
import { TimeSlot } from './TimeSlot';

interface TimePickerProps {
  /** Called when a time is selected. null = ASAP */
  onTimeSelect: (time: string | null) => void;
  /** Currently selected date (YYYY-MM-DD format) */
  selectedDate: string | null;
  /** Currently selected time (e.g., "9:00 AM") or null for ASAP */
  selectedTime: string | null;
  /** Whether recurring ride is enabled */
  isRecurring: boolean;
  /** Recurring frequency */
  recurringFrequency: RecurringFrequency;
  /** Selected days for custom recurring */
  recurringDays: string[];
  /** Recurring end date (null = ongoing) */
  recurringEndDate: string | null;
  /** Callback for date selection */
  onDateSelect: (date: string) => void;
  /** Callback for recurring toggle */
  onRecurringToggle: (isRecurring: boolean) => void;
  /** Callback for frequency change */
  onFrequencyChange: (frequency: RecurringFrequency) => void;
  /** Callback for days change */
  onDaysChange: (days: string[]) => void;
  /** Callback for end date change */
  onEndDateChange: (date: string | null) => void;
  className?: string;
}

/**
 * Generate time slots from 8:00 AM to 6:00 PM in 30-minute increments
 */
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 18; hour++) {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : hour === 12 ? 12 : hour;
    slots.push(`${displayHour}:00 ${period}`);
    if (hour < 18) {
      slots.push(`${displayHour}:30 ${period}`);
    }
  }
  return slots;
};

export function TimePicker({
  onTimeSelect,
  selectedDate,
  selectedTime,
  isRecurring,
  recurringFrequency,
  recurringDays,
  recurringEndDate,
  onDateSelect,
  onRecurringToggle,
  onFrequencyChange,
  onDaysChange,
  onEndDateChange,
  className,
}: TimePickerProps) {
  const timeSlots = generateTimeSlots();
  // Track if ASAP is selected (selectedTime is explicitly null vs undefined/initial)
  const isASAPSelected = selectedTime === null;

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time);
  };

  const handleASAP = () => {
    onTimeSelect(null);
  };

  return (
    <View className={`flex-1 ${className || ''}`}>
      {/* ASAP Option - Prominent at top */}
      <ASAPButton onPress={handleASAP} isSelected={isASAPSelected} />

      {/* Date Selection */}
      <DateSelector selectedDate={selectedDate} onDateSelect={onDateSelect} className="mt-4" />

      {/* Time Slots Section */}
      <Text className="mb-3 mt-6 text-lg font-semibold text-gray-700">Select a time</Text>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap">
          {timeSlots.map((time) => (
            <TimeSlot
              key={time}
              time={time}
              isSelected={selectedTime === time}
              onPress={() => handleTimeSelect(time)}
            />
          ))}
        </View>

        {/* Recurring Ride Option */}
        <RecurringRideToggle
          isRecurring={isRecurring}
          recurringFrequency={recurringFrequency}
          recurringDays={recurringDays}
          recurringEndDate={recurringEndDate}
          onToggle={onRecurringToggle}
          onFrequencyChange={onFrequencyChange}
          onDaysChange={onDaysChange}
          onEndDateChange={onEndDateChange}
          className="mt-6 border-t border-gray-200 pt-4"
        />
      </ScrollView>
    </View>
  );
}
