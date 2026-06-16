/**
 * ModifyRideScreen
 *
 * Screen for modifying ride time and/or destination.
 * Reuses booking components for consistent UX.
 *
 * Features:
 * - Loads existing ride data
 * - Modify scheduled pickup time
 * - Modify destination address
 * - Save Changes confirmation
 * - Full accessibility support
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';

import { DateSelector, TimeSlot } from '@/components/booking';
import { PhoneButton } from '@/components/PhoneButton';
import { AppHeader, BottomActionBar, Button } from '@/components/ui';
import { useRide, useModifyRide } from '@/hooks';

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

/**
 * Converts 12-hour time format to 24-hour format.
 */
function convertTo24Hour(time12: string): string {
  const parts = time12.split(' ');
  const time = parts[0] ?? '00:00';
  const period = parts[1] ?? 'AM';
  const timeParts = time.split(':');
  const hoursStr = timeParts[0] ?? '0';
  const minutesStr = timeParts[1] ?? '0';
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parse ISO timestamp to date (YYYY-MM-DD) and time (e.g., "10:00 AM")
 */
function parseScheduledTime(isoString: string | null): { date: string; time: string | null } {
  if (!isoString) {
    // Default to today
    const today = new Date().toISOString().split('T')[0] as string;
    return { date: today, time: null };
  }

  const dateObj = new Date(isoString);
  const date = isoString.split('T')[0] as string;

  // Convert to 12-hour format
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const time = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;

  return { date, time };
}

export default function ModifyRideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ride, isLoading, error } = useRide(id);
  const modifyMutation = useModifyRide();

  // Local state for modifications
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [destination, setDestination] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  const timeSlots = generateTimeSlots();

  // Initialize state from ride data
  useEffect(() => {
    if (ride) {
      const { date, time } = parseScheduledTime(ride.scheduled_pickup_time);
      setSelectedDate(date);
      setSelectedTime(time);
      setDestination(ride.dropoff_address);
    }
  }, [ride]);

  // Track changes
  useEffect(() => {
    if (!ride) return;

    const { date: originalDate, time: originalTime } = parseScheduledTime(
      ride.scheduled_pickup_time
    );
    const originalDestination = ride.dropoff_address;

    const dateChanged = selectedDate !== originalDate;
    const timeChanged = selectedTime !== originalTime;
    const destinationChanged = destination !== originalDestination;

    setHasChanges(dateChanged || timeChanged || destinationChanged);
  }, [ride, selectedDate, selectedTime, destination]);

  const handleSave = async () => {
    if (!id || !hasChanges) return;

    try {
      // Build the scheduled timestamp if date/time changed
      let scheduledPickupTime: string | undefined;
      if (selectedDate && selectedTime) {
        const time24 = convertTo24Hour(selectedTime);
        scheduledPickupTime = `${selectedDate}T${time24}:00`;
      } else if (selectedDate) {
        scheduledPickupTime = `${selectedDate}T08:00:00`; // Default to 8 AM if no time
      }

      // Build request with only changed fields
      const request: { rideId: string; scheduledPickupTime?: string; dropoffAddress?: string } = {
        rideId: id,
      };

      if (scheduledPickupTime) {
        request.scheduledPickupTime = scheduledPickupTime;
      }

      if (destination !== ride?.dropoff_address) {
        request.dropoffAddress = destination;
      }

      await modifyMutation.mutateAsync(request);

      Alert.alert('Ride Updated', 'Your ride has been updated successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Update Failed',
        'Unable to update your ride. Please try again or contact support.'
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <AppHeader mode="screen" title="Modify Ride" rightSlot={<PhoneButton />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1F3A5F" />
          <Text className="mt-4 font-sans text-body text-ink-secondary">Loading ride...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !ride) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <AppHeader mode="screen" title="Modify Ride" rightSlot={<PhoneButton />} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-error-100">
            <Ionicons name="alert-circle" size={40} color="#A83A35" />
          </View>
          <Text className="mt-4 font-sans-bold text-title-2 text-foreground">
            Unable to Load Ride
          </Text>
          <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
            We couldn&apos;t load the ride details. Please try again.
          </Text>
          <View className="mt-6 w-full max-w-[280px]">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              label="Go Back"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Check if ride can be modified
  const canModify = ride.status === 'pending' || ride.status === 'assigned';
  if (!canModify) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <AppHeader mode="screen" title="Modify Ride" rightSlot={<PhoneButton />} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-warning-100">
            <Ionicons name="lock-closed" size={40} color="#8A6420" />
          </View>
          <Text className="mt-4 font-sans-bold text-title-2 text-foreground">Cannot Modify</Text>
          <Text className="mt-2 text-center font-sans text-body text-ink-secondary">
            This ride cannot be modified because it is {ride.status}.
          </Text>
          <View className="mt-6 w-full max-w-[280px]">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              label="Go Back"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader mode="screen" title="Modify Ride" rightSlot={<PhoneButton />} />

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Current Pickup */}
        <View className="mb-6">
          <Text className="mb-2 font-sans-medium text-footnote text-ink-secondary">
            Pickup Location
          </Text>
          <View className="rounded-lg bg-card px-4 py-4">
            <Text className="font-sans text-body text-foreground">{ride.pickup_address}</Text>
            <Text className="mt-1 font-sans text-footnote text-ink-secondary">
              Cannot be changed
            </Text>
          </View>
        </View>

        {/* Destination (editable) */}
        <View className="mb-6">
          <Text className="mb-2 font-sans-medium text-footnote text-ink-secondary">
            Destination
          </Text>
          <TextInput
            className="border-strong min-h-touch-lg rounded-sm border bg-card px-4 font-sans text-body text-foreground"
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination address"
            placeholderTextColor="#6E685E"
            accessibilityLabel="Destination address"
            accessibilityHint="Enter the destination for your ride"
          />
        </View>

        {/* Date Selection */}
        <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} className="mb-6" />

        {/* Time Selection */}
        <View className="mb-6">
          <Text className="mb-3 font-sans-semibold text-headline text-foreground">
            Select a time
          </Text>
          <View className="flex-row flex-wrap">
            {timeSlots.map((time) => (
              <TimeSlot
                key={time}
                time={time}
                isSelected={selectedTime === time}
                onPress={() => setSelectedTime(time)}
              />
            ))}
          </View>
        </View>

        {/* Spacing at bottom */}
        <View className="h-24" />
      </ScrollView>

      {/* Save Button — safe-area aware sticky footer */}
      <BottomActionBar>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          label={modifyMutation.isPending ? 'Saving...' : 'Save Changes'}
          loading={modifyMutation.isPending}
          disabled={!hasChanges || modifyMutation.isPending}
          leftIcon={
            modifyMutation.isPending ? undefined : (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )
          }
          onPress={handleSave}
          accessibilityLabel={
            modifyMutation.isPending
              ? 'Saving changes'
              : hasChanges
                ? 'Save changes to your ride'
                : 'No changes to save'
          }
        />

        {!hasChanges && (
          <Text className="mt-2 text-center font-sans text-footnote text-ink-secondary">
            Make changes to your ride to enable saving
          </Text>
        )}
      </BottomActionBar>
    </SafeAreaView>
  );
}
