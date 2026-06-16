/**
 * WaitTimeIndicator Component
 *
 * Calming indicator showing included wait time.
 * Reinforces patience and sets expectations for senior riders.
 *
 * Features:
 * - Clock icon for visual clarity
 * - Calm Veteran Honor styling: stone surface, sage icon, ink-secondary text
 * - A reassuring "included" feature — never a countdown, never red
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
      className={`flex-row items-center self-start rounded-md bg-background px-4 py-3 ${className}`}
      accessibilityLabel={`${waitMinutes} minutes of wait time included with your ride`}
      accessibilityRole="text">
      {/* sage clock — calm, supportive; never countdown red */}
      <Ionicons name="time-outline" size={22} color="#4A6B54" />
      <Text className="ml-2 font-sans text-lg text-ink-secondary">
        {waitMinutes} min wait time included
      </Text>
    </View>
  );
}
