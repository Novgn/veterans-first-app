/**
 * CancellationSuccessScreen Component
 *
 * Full-screen confirmation after ride cancellation.
 * Features 60-second undo window for mistake forgiveness.
 *
 * Features:
 * - "Ride Cancelled" confirmation message
 * - 60-second UndoButton with countdown
 * - On undo: restore ride to previous status
 * - "Done" button returns to My Rides tab
 * - Full accessibility support
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';

import { useSupabase } from '../../../lib/supabase';
import { useUndoCancellation } from '../hooks/useUndoCancellation';

interface CancellationSuccessScreenProps {
  /** Ride ID that was cancelled */
  rideId: string;
  /** Destination name for display */
  destinationName: string;
  /** Previous status before cancellation (for undo) */
  previousStatus?: string;
}

/** Duration of undo window in seconds */
const UNDO_WINDOW_SECONDS = 60;

export function CancellationSuccessScreen({
  rideId,
  destinationName,
  previousStatus = 'pending',
}: CancellationSuccessScreenProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(UNDO_WINDOW_SECONDS);
  const [isUndoing, setIsUndoing] = useState(false);
  const undoMutation = useUndoCancellation();
  const supabase = useSupabase();

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUndo = useCallback(async () => {
    if (isUndoing) return;

    setIsUndoing(true);
    try {
      await undoMutation.mutateAsync({
        rideId,
        previousStatus,
      });

      Alert.alert('Ride Restored', 'Your ride has been restored successfully.');
      router.replace('/(tabs)/rides');
    } catch (error) {
      Alert.alert(
        'Undo Failed',
        'Unable to restore your ride. Please try again or contact support.'
      );
      setIsUndoing(false);
    }
  }, [rideId, previousStatus, isUndoing, undoMutation]);

  const handleDone = () => {
    router.replace('/(tabs)/rides');
  };

  const canUndo = secondsRemaining > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        {/* Cancelled icon */}
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gray-200">
          <Ionicons name="close-circle" size={56} color="#6B7280" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-foreground" accessibilityRole="header">
          Ride Cancelled
        </Text>

        {/* Description */}
        <Text className="mt-2 text-center text-lg text-gray-600">
          Your ride to {destinationName} has been cancelled.
        </Text>

        {/* Undo section */}
        {canUndo && (
          <View className="mt-8 w-full">
            <Pressable
              onPress={handleUndo}
              disabled={isUndoing}
              className={`min-h-[56px] flex-row items-center justify-center rounded-xl border border-primary bg-primary/10 px-6 active:bg-primary/20 ${isUndoing ? 'opacity-50' : ''}`}
              accessibilityLabel={
                isUndoing
                  ? 'Restoring ride'
                  : `Undo cancellation. ${secondsRemaining} seconds remaining`
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: isUndoing }}>
              <Ionicons name="arrow-undo" size={24} color="#1E40AF" />
              <Text className="ml-3 text-lg font-semibold text-primary">
                {isUndoing ? 'Restoring...' : `Undo (${secondsRemaining}s)`}
              </Text>
            </Pressable>

            <Text className="mt-3 text-center text-base text-gray-500">
              Changed your mind? Tap to restore your ride.
            </Text>
          </View>
        )}

        {/* Timer expired message */}
        {!canUndo && (
          <View className="mt-8 rounded-xl bg-gray-100 p-4">
            <Text className="text-center text-base text-gray-600">
              The undo window has expired. You can book a new ride from the home screen.
            </Text>
          </View>
        )}
      </View>

      {/* Done button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleDone}
          className="min-h-[56px] items-center justify-center rounded-xl bg-primary active:opacity-80"
          accessibilityLabel="Done, return to My Rides"
          accessibilityRole="button">
          <Text className="text-lg font-bold text-white">Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
