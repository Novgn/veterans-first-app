/**
 * BookingWizard Step 2: Time Selection
 *
 * Second step of the 3-tap booking flow.
 * Users select when they want to be picked up.
 *
 * Features:
 * - ASAP option for immediate rides
 * - Date selection (Today, Tomorrow, custom)
 * - Time slots from 8 AM to 6 PM in 30-min increments
 * - Optional recurring ride configuration
 */

import { router } from 'expo-router';
import { View, Text, SafeAreaView } from 'react-native';

import { Header } from '@/components/Header';
import { StepIndicator, TimePicker } from '@/components/booking';
import { useBookingStore } from '@/stores/bookingStore';

export default function BookingStep2() {
  const {
    dropoffDestination,
    selectedDate,
    selectedTime,
    isRecurring,
    recurringFrequency,
    recurringDays,
    recurringEndDate,
    setCurrentStep,
    setSelectedDate,
    setSelectedTime,
    setIsRecurring,
    setRecurringFrequency,
    setRecurringDays,
    setRecurringEndDate,
  } = useBookingStore();

  const handleBack = () => {
    setCurrentStep(1);
    router.back();
  };

  const handleTimeSelect = (time: string | null) => {
    setSelectedTime(time);
    // Advance to Step 3 (Confirmation)
    setCurrentStep(3);
    router.push('/booking/confirm');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header showBackButton onBack={handleBack} title="Book a Ride" />
      <View className="flex-1 px-6 pt-4">
        <StepIndicator currentStep={2} totalSteps={3} />

        <Text className="mt-6 text-2xl font-bold text-foreground">When do you need a ride?</Text>
        <Text className="mt-1 text-lg text-gray-700">Select your pickup time</Text>

        {/* Show selected destination */}
        {dropoffDestination && (
          <View className="mt-4 rounded-xl bg-gray-100 p-4">
            <Text className="text-sm font-medium text-gray-500">Going to:</Text>
            <Text className="mt-1 text-lg font-semibold text-foreground">
              {dropoffDestination.name}
            </Text>
            <Text className="text-base text-gray-600">{dropoffDestination.address}</Text>
          </View>
        )}

        {/* Time Selection */}
        <TimePicker
          onTimeSelect={handleTimeSelect}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          isRecurring={isRecurring}
          recurringFrequency={recurringFrequency}
          recurringDays={recurringDays}
          recurringEndDate={recurringEndDate}
          onDateSelect={handleDateSelect}
          onRecurringToggle={setIsRecurring}
          onFrequencyChange={setRecurringFrequency}
          onDaysChange={setRecurringDays}
          onEndDateChange={setRecurringEndDate}
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
}
