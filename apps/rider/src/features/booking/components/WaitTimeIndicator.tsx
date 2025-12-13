/**
 * WaitTimeIndicator Component
 *
 * Calming indicator showing included wait time.
 * Reinforces patience and sets expectations for senior riders.
 *
 * Features:
 * - Clock icon for visual clarity
 * - Calming green color (#059669)
 * - Senior-friendly 18px+ text size
 * - Full accessibility support
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

interface WaitTimeIndicatorProps {
  /** Wait time in minutes */
  waitMinutes: number;
  /** Additional NativeWind classes */
  className?: string;
}

export function WaitTimeIndicator({ waitMinutes, className = '' }: WaitTimeIndicatorProps) {
  return (
    <View
      className={`flex-row items-center ${className}`}
      accessibilityLabel={`${waitMinutes} minutes of wait time included with your ride`}
      accessibilityRole="text">
      <Ionicons name="time-outline" size={22} color="#059669" />
      <Text className="ml-2 text-lg text-secondary">{waitMinutes} min wait time included</Text>
    </View>
  );
}
