/**
 * BookingWizard Step 2: Time Selection (Placeholder)
 *
 * Second step of the 3-tap booking flow.
 * Users select when they want to be picked up.
 *
 * Full implementation in Story 2.4.
 */

import { router } from 'expo-router';
import { View, Text, SafeAreaView, Pressable } from 'react-native';

import { Header } from '../../src/components/Header';
import { StepIndicator } from '../../src/features/booking';
import { useBookingStore } from '../../src/stores/bookingStore';

export default function BookingStep2() {
  const { dropoffDestination, setCurrentStep } = useBookingStore();

  const handleBack = () => {
    setCurrentStep(1);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header showBackButton onBack={handleBack} title="Book a Ride" />
      <View className="flex-1 px-6 pt-4">
        <StepIndicator currentStep={2} totalSteps={3} />

        <Text className="mt-6 text-2xl font-bold text-foreground">
          When do you need to be picked up?
        </Text>
        <Text className="mt-1 text-lg text-gray-700">Select your pickup time</Text>

        {/* Show selected destination */}
        {dropoffDestination && (
          <View className="mt-6 rounded-xl bg-gray-100 p-4">
            <Text className="text-sm font-medium text-gray-500">Going to:</Text>
            <Text className="mt-1 text-lg font-semibold text-foreground">
              {dropoffDestination.name}
            </Text>
            <Text className="text-base text-gray-600">{dropoffDestination.address}</Text>
          </View>
        )}

        {/* Placeholder content */}
        <View className="mt-8 flex-1 items-center justify-center">
          <Text className="text-center text-lg text-gray-500">
            Time selection will be available in the next update.
          </Text>
          <Pressable
            onPress={handleBack}
            className="mt-4 rounded-xl bg-primary px-6 py-3"
            accessibilityLabel="Go back to destination selection"
            accessibilityRole="button">
            <Text className="text-lg font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
