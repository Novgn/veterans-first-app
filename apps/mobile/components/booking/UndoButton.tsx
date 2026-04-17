/**
 * UndoButton Component
 *
 * 60-second undo button for recently booked rides.
 * Provides mistake forgiveness and builds trust.
 *
 * Features:
 * - 60-second countdown timer
 * - "Undo (XXs)" display format
 * - Auto-hides when timer expires
 * - Cancels ride in database on press
 * - Full accessibility support
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { Pressable, Text, Alert } from 'react-native';

import { useSupabase } from '@/lib/supabase';

interface UndoButtonProps {
  /** Ride ID to cancel */
  rideId: string;
  /** Callback when undo is complete or cancelled */
  onUndoComplete: () => void;
  /** Additional NativeWind classes */
  className?: string;
}

/** Duration of undo window in seconds */
const UNDO_WINDOW_SECONDS = 60;

export function UndoButton({ rideId, onUndoComplete, className = '' }: UndoButtonProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(UNDO_WINDOW_SECONDS);
  const [isUndoing, setIsUndoing] = useState(false);
  const supabase = useSupabase();

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
      // Cancel the ride in the database
      const { error } = await supabase
        .from('rides')
        .update({ status: 'cancelled' })
        .eq('id', rideId);

      if (error) {
        throw error;
      }

      Alert.alert('Booking Cancelled', 'Your ride has been cancelled successfully.');
      onUndoComplete();
    } catch {
      Alert.alert(
        'Undo Failed',
        'Unable to cancel your booking. Please try again or contact support.'
      );
      setIsUndoing(false);
    }
  }, [rideId, onUndoComplete, isUndoing, supabase]);

  // Don't render if time has expired
  if (secondsRemaining <= 0) return null;

  return (
    <Pressable
      onPress={handleUndo}
      disabled={isUndoing}
      className={`min-h-[48px] flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 active:bg-red-100 ${isUndoing ? 'opacity-50' : ''} ${className}`}
      accessibilityLabel={
        isUndoing ? 'Undoing booking' : `Undo booking. ${secondsRemaining} seconds remaining`
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isUndoing }}>
      <Ionicons name="arrow-undo" size={20} color="#DC2626" />
      <Text className="ml-2 text-base font-medium text-red-600">
        {isUndoing ? 'Undoing...' : `Undo (${secondsRemaining}s)`}
      </Text>
    </Pressable>
  );
}
