/**
 * RecurringRideToggle Component
 *
 * Toggle switch with expandable recurring ride configuration options.
 * Shows frequency, day selection, and end date when enabled.
 *
 * @example
 * <RecurringRideToggle className="mt-4" />
 */

import { View, Text, Switch } from 'react-native';

import { DaySelector } from './DaySelector';
import { EndDateSelector } from './EndDateSelector';
import { FrequencySelector, RecurringFrequency } from './FrequencySelector';

interface RecurringRideToggleProps {
  isRecurring: boolean;
  recurringFrequency: RecurringFrequency;
  recurringDays: string[];
  recurringEndDate: string | null;
  onToggle: (isRecurring: boolean) => void;
  onFrequencyChange: (frequency: RecurringFrequency) => void;
  onDaysChange: (days: string[]) => void;
  onEndDateChange: (date: string | null) => void;
  className?: string;
}

export function RecurringRideToggle({
  isRecurring,
  recurringFrequency,
  recurringDays,
  recurringEndDate,
  onToggle,
  onFrequencyChange,
  onDaysChange,
  onEndDateChange,
  className,
}: RecurringRideToggleProps) {
  return (
    <View className={className}>
      {/* Toggle */}
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">Make this a recurring ride</Text>
        <Switch
          value={isRecurring}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#059669' }}
          thumbColor={isRecurring ? '#FFFFFF' : '#F3F4F6'}
          accessibilityLabel="Toggle recurring ride"
          accessibilityRole="switch"
        />
      </View>

      {/* Recurring Options (shown when enabled) */}
      {isRecurring && (
        <View className="mt-4">
          <FrequencySelector selectedFrequency={recurringFrequency} onSelect={onFrequencyChange} />

          {recurringFrequency === 'custom' && (
            <DaySelector selectedDays={recurringDays} onSelect={onDaysChange} className="mt-4" />
          )}

          {/* End Date Selection */}
          <EndDateSelector
            endDate={recurringEndDate}
            onEndDateChange={onEndDateChange}
            className="mt-4"
          />
        </View>
      )}
    </View>
  );
}
