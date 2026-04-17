/**
 * BookingWizard Step 1: Destination Selection
 *
 * First step of the 3-tap booking flow.
 * Users select their destination from saved places or search for a new address.
 *
 * AC #1: "Where are you going?" screen with DestinationPicker
 * AC #3: Advances to Step 2 on destination selection with progress indicator
 */

import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';

import { Header } from '@/components/Header';
import { DestinationPicker, StepIndicator } from '@/components/booking';
import { useDestinations } from '@/hooks/useDestinations';
import { useBookingStore, Destination } from '@/stores/bookingStore';

export default function BookingStep1() {
  const { setDropoffDestination, setCurrentStep, loadSavedDestinations, resetBooking } =
    useBookingStore();
  const { data: savedDestinations = [] } = useDestinations();

  // Load saved destinations into booking store when they're fetched
  useEffect(() => {
    if (savedDestinations.length > 0) {
      loadSavedDestinations(savedDestinations);
    }
  }, [savedDestinations, loadSavedDestinations]);

  const handleDestinationSelect = (destination: Destination) => {
    setDropoffDestination(destination);
    setCurrentStep(2);
    router.push('/booking/time');
  };

  const handleBack = () => {
    resetBooking();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header showBackButton onBack={handleBack} title="Book a Ride" />
      <View className="flex-1 px-6 pt-4">
        <StepIndicator currentStep={1} totalSteps={3} />

        <Text className="mt-6 text-2xl font-bold text-foreground">Where are you going?</Text>
        <Text className="mt-1 text-lg text-gray-700">Select a destination to continue</Text>

        <DestinationPicker onSelect={handleDestinationSelect} className="mt-6 flex-1" />
      </View>
    </SafeAreaView>
  );
}
