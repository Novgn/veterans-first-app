/**
 * BookingWizard Step 3: Confirmation
 *
 * Third and final step of the 3-tap booking flow.
 * Users review their ride details and confirm with one tap.
 *
 * Uses the unified design primitives (AppHeader, Card, ListRow, BottomActionBar,
 * RouteIndicator, Alert, Button) to present a single visual hierarchy:
 *   - Route card (elevated)
 *   - Schedule card (outlined)
 *   - Trust-signals card (flat) wrapping price-lock + wait-time badges
 *   - Driver preference row (self-styled)
 *   - Price card (outlined) with "final price after driver assignment" note
 *   - BottomActionBar pins the primary CTA with safe-area aware padding
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 * Story 2.7: Preferred Driver Selection
 */

import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert as RNAlert } from 'react-native';

import {
  AppHeader,
  Alert,
  BottomActionBar,
  Button,
  Card,
  ListRow,
  RouteIndicator,
} from '@/components/ui';
import {
  StepIndicator,
  PriceLockBadge,
  WaitTimeIndicator,
  BookingSuccessScreen,
} from '@/components/booking';
import { DriverPreferenceRow, DriverSelectionSheet } from '@/components/drivers';
import { PhoneButton } from '@/components/PhoneButton';
import { useBookRide } from '@/hooks/useBookRide';
import { usePreferredDriver } from '@/hooks/usePreferredDriver';
import { useSupabaseUserId } from '@/hooks/useSupabaseUserId';
import { useBookingStore } from '@/stores/bookingStore';

/** Mock price in cents for MVP - real pricing Edge Function in future story */
const MOCK_PRICE_CENTS = 4500; // $45

/** Default wait time in minutes */
const DEFAULT_WAIT_MINUTES = 20;

/**
 * Formats an ISO date string (YYYY-MM-DD) to a friendly display.
 * Returns "Today", "Tomorrow", or "Mon, Jan 5".
 */
function formatDateDisplay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (inputDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function BookingStep3() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDriverSheet, setShowDriverSheet] = useState(false);

  const { userId } = useAuth();
  const { data: supabaseUserId } = useSupabaseUserId();
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
      RNAlert.alert('Missing Destination', 'Please select a destination before booking.');
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
      RNAlert.alert('Booking Failed', 'Unable to complete your booking. Please try again.');
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
        <AppHeader
          mode="screen"
          title="Review your ride"
          onBack={handleBack}
          rightSlot={<PhoneButton />}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-sans text-body text-ink-secondary">No destination selected.</Text>
          <View className="mt-4 w-full max-w-[280px]">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              label="Go back"
              onPress={handleBack}
              accessibilityLabel="Go back to select destination"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const displayDate = selectedDate ?? new Date().toISOString().split('T')[0] ?? '';
  const formattedDate = formatDateDisplay(displayDate);
  const displayTime = selectedTime || 'ASAP';
  const scheduleTitle = `${formattedDate} at ${displayTime}`;
  const recurringDescription = getRecurringDescription();

  // Build route stops — synthesize labels when missing
  const pickupStop = {
    label: pickupDestination?.name ?? 'Pickup',
    address: pickupDestination?.address,
  };
  const destinationStop = {
    label: dropoffDestination.name || 'Destination',
    address: dropoffDestination.address,
  };

  const isSubmitting = bookRideMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        mode="screen"
        title="Review your ride"
        onBack={handleBack}
        rightSlot={<PhoneButton />}
      />

      <ScrollView className="flex-1">
        <View className="gap-4 px-6 pb-6 pt-4">
          {/* Step indicator (canonical progress widget) */}
          <StepIndicator currentStep={3} totalSteps={3} />

          <Text className="font-sans-bold text-title-1 text-foreground">Review your ride</Text>

          {/* Route */}
          <Card variant="elevated" padding="lg">
            <RouteIndicator pickup={pickupStop} destination={destinationStop} size="md" />
          </Card>

          {/* Schedule summary */}
          <Card variant="outlined" padding="none">
            <ListRow
              leading={<Ionicons name="time" size={22} color="#1F3A5F" />}
              leadingTint="primary"
              title={scheduleTitle}
              subtitle={recurringDescription}
            />
          </Card>

          {/* Trust signals — locked price + included wait time grouped visually */}
          <Card variant="flat" padding="md">
            <View className="gap-3">
              <PriceLockBadge priceCents={MOCK_PRICE_CENTS} />
              <WaitTimeIndicator waitMinutes={DEFAULT_WAIT_MINUTES} />
            </View>
          </Card>

          {/* Driver preference (DriverPreferenceRow is already visually wrapped) */}
          <DriverPreferenceRow
            selectedDriverId={preferredDriverId}
            selectedDriverName={preferredDriverName}
            onPress={() => setShowDriverSheet(true)}
            testID="driver-preference-row"
          />

          {/* Calm reassurance — price is final once a driver is assigned */}
          <Alert
            variant="info"
            message="Your locked price is confirmed when your driver is assigned. Take your time."
          />
        </View>
      </ScrollView>

      {/* Sticky CTA — safe-area aware, no absolute positioning */}
      <BottomActionBar>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          label="Book This Ride"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleBookRide}
          accessibilityLabel={isSubmitting ? 'Booking in progress' : 'Book This Ride'}
        />
      </BottomActionBar>

      {/* Driver Selection Sheet - Story 2.7 */}
      <DriverSelectionSheet
        visible={showDriverSheet}
        onClose={() => setShowDriverSheet(false)}
        onSelect={(driverId, driverName) => {
          setPreferredDriver(driverId, driverName);
        }}
        selectedDriverId={preferredDriverId}
        riderId={supabaseUserId ?? undefined}
        testID="driver-selection-sheet"
      />
    </SafeAreaView>
  );
}
