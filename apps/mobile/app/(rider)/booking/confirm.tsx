/**
 * BookingWizard Step 3: Confirmation
 *
 * Third and final step of the 3-tap booking flow.
 * Users review their ride details and confirm with one tap.
 *
 * Features:
 * - RideSummaryCard with route, date, time
 * - DriverPreferenceRow for requesting specific driver (Story 2.7)
 * - PriceLockBadge with "No surge. Ever."
 * - WaitTimeIndicator showing included wait time
 * - Large "Book This Ride" button (56dp height)
 * - Success screen with 60-second undo
 * - Full accessibility support
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 * Story 2.7: Preferred Driver Selection
 */

import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from 'react-native';

import { Header } from '@/components/Header';
import {
  StepIndicator,
  PriceLockBadge,
  WaitTimeIndicator,
  RideSummaryCard,
  BookingSuccessScreen,
} from '@/features/booking';
import { useBookRide } from '@/features/booking/hooks/useBookRide';
import { DriverPreferenceRow, DriverSelectionSheet, usePreferredDriver } from '@/features/drivers';
import { useBookingStore } from '@/stores/bookingStore';

/** Mock price in cents for MVP - real pricing Edge Function in future story */
const MOCK_PRICE_CENTS = 4500; // $45

/** Default wait time in minutes */
const DEFAULT_WAIT_MINUTES = 20;

export default function BookingStep3() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDriverSheet, setShowDriverSheet] = useState(false);

  const { userId } = useAuth();
  const {
    pickupDestination,
    dropoffDestination,
    selectedDate,
    selectedTime,
    isRecurring,
    recurringFrequency,
    recurringDays,
    preferredDriverId,
    preferredDriverName,
    setCurrentStep,
    setPreferredDriver,
  } = useBookingStore();

  // Fetch user's default preferred driver - Story 2.7 AC#3
  const { preferredDriver: defaultPreferredDriver } = usePreferredDriver(userId ?? undefined);

  // Pre-populate preferred driver from user's default (only if not already set)
  useEffect(() => {
    if (
      defaultPreferredDriver?.preferredDriverId &&
      defaultPreferredDriver?.driver &&
      preferredDriverId === null
    ) {
      setPreferredDriver(
        defaultPreferredDriver.preferredDriverId,
        defaultPreferredDriver.driver.firstName
      );
    }
  }, [defaultPreferredDriver, preferredDriverId, setPreferredDriver]);

  const bookRideMutation = useBookRide();

  const handleBack = () => {
    setCurrentStep(2);
    router.back();
  };

  const handleBookRide = async () => {
    if (!dropoffDestination) {
      Alert.alert('Missing Destination', 'Please select a destination before booking.');
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0] ?? '';

    try {
      await bookRideMutation.mutateAsync({
        pickupDestination,
        dropoffDestination,
        scheduledDate: selectedDate ?? todayDate,
        scheduledTime: selectedTime,
        priceCents: MOCK_PRICE_CENTS,
        isRecurring,
        recurringFrequency,
        recurringDays,
        preferredDriverId,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Booking failed:', error);
      Alert.alert('Booking Failed', 'Unable to complete your booking. Please try again.');
    }
  };

  // Generate recurring description for display
  const getRecurringDescription = (): string | undefined => {
    if (!isRecurring) return undefined;

    if (recurringFrequency === 'daily') {
      return 'Every day';
    }
    if (recurringFrequency === 'weekly') {
      return 'Every week';
    }
    if (recurringFrequency === 'custom' && recurringDays.length > 0) {
      // Format day names nicely
      const dayNames: Record<string, string> = {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun',
      };
      return recurringDays.map((d) => dayNames[d] || d).join(', ');
    }
    return 'Recurring ride';
  };

  // Show success screen after booking
  if (showSuccess) {
    return <BookingSuccessScreen />;
  }

  // If no destination, redirect back
  if (!dropoffDestination) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Header showBackButton onBack={handleBack} title="Book a Ride" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg text-gray-600">No destination selected.</Text>
          <Pressable
            onPress={handleBack}
            className="mt-4 min-h-[48px] items-center justify-center rounded-xl bg-primary px-8"
            accessibilityLabel="Go back to select destination"
            accessibilityRole="button">
            <Text className="text-lg font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayDate = selectedDate ?? new Date().toISOString().split('T')[0] ?? '';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header showBackButton onBack={handleBack} title="Book a Ride" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-4">
          <StepIndicator currentStep={3} totalSteps={3} />

          <Text
            className="mt-6 text-2xl font-bold text-foreground"
            accessibilityRole="header"
            accessibilityLabel="Step 3: Confirm your ride">
            Confirm your ride
          </Text>
          <Text className="mt-1 text-lg text-gray-700">Review and book with one tap</Text>

          {/* Ride Summary */}
          <RideSummaryCard
            pickup={pickupDestination}
            dropoff={dropoffDestination}
            date={displayDate}
            time={selectedTime}
            isRecurring={isRecurring}
            recurringDescription={getRecurringDescription()}
            className="mt-6"
          />

          {/* Driver Preference - Story 2.7 */}
          <View className="mt-4">
            <DriverPreferenceRow
              selectedDriverId={preferredDriverId}
              selectedDriverName={preferredDriverName}
              onPress={() => setShowDriverSheet(true)}
              testID="driver-preference-row"
            />
          </View>

          {/* Price Lock Badge */}
          <PriceLockBadge priceCents={MOCK_PRICE_CENTS} className="mt-4" />

          {/* Wait Time Indicator */}
          <WaitTimeIndicator waitMinutes={DEFAULT_WAIT_MINUTES} className="mt-4 px-1" />
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-background px-6 pb-8 pt-4">
        <Pressable
          onPress={handleBookRide}
          disabled={bookRideMutation.isPending}
          className={`min-h-[56px] items-center justify-center rounded-xl ${
            bookRideMutation.isPending ? 'bg-gray-300' : 'bg-primary'
          } active:opacity-80`}
          accessibilityLabel={bookRideMutation.isPending ? 'Booking in progress' : 'Book this ride'}
          accessibilityRole="button"
          accessibilityState={{ disabled: bookRideMutation.isPending }}>
          <Text className="text-lg font-bold text-white">
            {bookRideMutation.isPending ? 'Booking...' : 'Book This Ride'}
          </Text>
        </Pressable>
      </View>

      {/* Driver Selection Sheet - Story 2.7 */}
      <DriverSelectionSheet
        visible={showDriverSheet}
        onClose={() => setShowDriverSheet(false)}
        onSelect={(driverId, driverName) => {
          setPreferredDriver(driverId, driverName);
        }}
        selectedDriverId={preferredDriverId}
        riderId={userId ?? undefined}
        testID="driver-selection-sheet"
      />
    </SafeAreaView>
  );
}
