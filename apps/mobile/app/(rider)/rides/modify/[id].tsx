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
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';

import { Header } from '@/components/Header';
import { DateSelector, TimeSlot } from '@/features/booking';
import { useRide, useModifyRide } from '@/features/rides';

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
        <Header showBackButton onBack={() => router.back()} title="Modify Ride" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text className="mt-4 text-lg text-gray-600">Loading ride...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !ride) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ headerShown: false }} />
        <Header showBackButton onBack={() => router.back()} title="Modify Ride" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="alert-circle" size={40} color="#DC2626" />
          </View>
          <Text className="mt-4 text-xl font-bold text-foreground">Unable to Load Ride</Text>
          <Text className="mt-2 text-center text-lg text-gray-600">
            We couldn&apos;t load the ride details. Please try again.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 min-h-[56px] items-center justify-center rounded-xl bg-primary px-8 active:opacity-80"
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Text className="text-lg font-bold text-white">Go Back</Text>
          </Pressable>
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
        <Header showBackButton onBack={() => router.back()} title="Modify Ride" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <Ionicons name="lock-closed" size={40} color="#F59E0B" />
          </View>
          <Text className="mt-4 text-xl font-bold text-foreground">Cannot Modify</Text>
          <Text className="mt-2 text-center text-lg text-gray-600">
            This ride cannot be modified because it is {ride.status}.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 min-h-[56px] items-center justify-center rounded-xl bg-primary px-8 active:opacity-80"
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Text className="text-lg font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <Header showBackButton onBack={() => router.back()} title="Modify Ride" />

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Current Pickup */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-500">Pickup Location</Text>
          <View className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <Text className="text-lg text-foreground">{ride.pickup_address}</Text>
            <Text className="mt-1 text-sm text-gray-500">Cannot be changed</Text>
          </View>
        </View>

        {/* Destination (editable) */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-500">Destination</Text>
          <TextInput
            className="min-h-[56px] rounded-xl border border-gray-300 bg-white px-4 text-lg"
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination address"
            placeholderTextColor="#9CA3AF"
            accessibilityLabel="Destination address"
            accessibilityHint="Enter the destination for your ride"
          />
        </View>

        {/* Date Selection */}
        <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} className="mb-6" />

        {/* Time Selection */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-gray-700">Select a time</Text>
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

      {/* Save Button */}
      <View className="border-t border-gray-200 bg-background px-6 pb-8 pt-4">
        <Pressable
          onPress={handleSave}
          disabled={!hasChanges || modifyMutation.isPending}
          className={`min-h-[56px] flex-row items-center justify-center rounded-xl active:opacity-80 ${
            hasChanges && !modifyMutation.isPending ? 'bg-primary' : 'bg-gray-300'
          }`}
          accessibilityLabel={
            modifyMutation.isPending
              ? 'Saving changes'
              : hasChanges
                ? 'Save changes to your ride'
                : 'No changes to save'
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasChanges || modifyMutation.isPending }}>
          {modifyMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="ml-3 text-lg font-bold text-white">Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text className="ml-3 text-lg font-bold text-white">Save Changes</Text>
            </>
          )}
        </Pressable>

        {!hasChanges && (
          <Text className="mt-2 text-center text-sm text-gray-500">
            Make changes to your ride to enable saving
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
