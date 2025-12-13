/**
 * BookingSuccessScreen Component
 *
 * Celebration screen shown after successful booking.
 * Provides positive reinforcement and important post-booking actions.
 *
 * Features:
 * - Green checkmark celebration animation
 * - Confirmation number display
 * - Ride summary
 * - 60-second undo window
 * - "Add to Calendar" option
 * - "Done" button to return home
 * - Full accessibility support
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBookingStore } from '../../../stores/bookingStore';

import { UndoButton } from './UndoButton';

interface BookingSuccessScreenProps {
  /** Optional callback after done is pressed */
  onDone?: () => void;
}

/**
 * Formats a date string for display.
 */
function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return 'Today';

  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate.getTime() === today.getTime()) return 'Today';
  if (inputDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function BookingSuccessScreen({ onDone }: BookingSuccessScreenProps) {
  const { lastBookingId, dropoffDestination, selectedDate, selectedTime, resetBooking } =
    useBookingStore();
  const [canUndo, setCanUndo] = useState(true);

  // Animation values
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    // Celebratory animation - pop in with bounce
    checkmarkScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    // Undo window expires after 60 seconds
    const timer = setTimeout(() => setCanUndo(false), 60000);
    return () => clearTimeout(timer);
  }, [checkmarkScale]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const handleDone = useCallback(() => {
    resetBooking();
    if (onDone) {
      onDone();
    } else {
      router.replace('/(tabs)');
    }
  }, [resetBooking, onDone]);

  const handleAddToCalendar = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Calendar integration will be available in a future update. Your ride details have been saved.',
      [{ text: 'OK', style: 'default' }]
    );
  }, []);

  // Generate confirmation number from booking ID
  const confirmationNumber = lastBookingId?.slice(0, 8).toUpperCase() || 'PENDING';

  // Format display values
  const displayDate = formatDisplayDate(selectedDate);
  const displayTime = selectedTime || 'ASAP';
  const destinationName = dropoffDestination?.name || 'Your destination';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success checkmark with animation */}
        <Animated.View
          style={checkmarkStyle}
          className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-secondary"
          accessibilityLabel="Success checkmark">
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>

        {/* Success message */}
        <Text className="text-2xl font-bold text-foreground" accessibilityRole="header">
          Your ride is booked!
        </Text>

        {/* Confirmation number */}
        <Text className="mt-2 text-lg text-gray-600">Confirmation #{confirmationNumber}</Text>

        {/* Ride summary */}
        <View
          className="mt-6 w-full rounded-xl bg-gray-100 p-4"
          accessibilityLabel={`Ride to ${destinationName} on ${displayDate} at ${displayTime}`}>
          <Text className="text-center text-lg text-gray-700">
            {destinationName} on {displayDate} at {displayTime}
          </Text>
        </View>

        {/* Undo button - only shown for 60 seconds */}
        {canUndo && lastBookingId && (
          <UndoButton rideId={lastBookingId} onUndoComplete={handleDone} className="mt-6 w-full" />
        )}

        {/* Add to Calendar */}
        <Pressable
          onPress={handleAddToCalendar}
          className="mt-4 min-h-[48px] flex-row items-center justify-center active:opacity-70"
          accessibilityLabel="Add ride to calendar"
          accessibilityRole="button">
          <Ionicons name="calendar-outline" size={20} color="#1E40AF" />
          <Text className="ml-2 text-base font-medium text-primary">Add to Calendar</Text>
        </Pressable>
      </View>

      {/* Done button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleDone}
          className="min-h-[56px] items-center justify-center rounded-xl bg-primary active:opacity-80"
          accessibilityLabel="Done, return to home"
          accessibilityRole="button">
          <Text className="text-lg font-bold text-white">Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
