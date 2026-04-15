/**
 * CountdownTimer component for displaying time remaining on ride offers
 *
 * Features:
 * - Displays minutes:seconds format
 * - Changes color based on urgency (green -> yellow -> red)
 * - Pulse animation when critical (< 30 seconds)
 * - Calls onExpire callback when timer reaches 0
 */

import { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

interface CountdownTimerProps {
  /** Time remaining in seconds */
  seconds: number;
  /** Callback when timer reaches 0 */
  onExpire: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Animated countdown timer with urgency-based styling
 */
export function CountdownTimer({ seconds, onExpire, testID }: CountdownTimerProps) {
  const hasExpired = useRef(false);
  const scale = useSharedValue(1);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;

  // Determine urgency level
  const isUrgent = seconds < 60;
  const isCritical = seconds < 30;

  // Pulse animation when critical
  useEffect(() => {
    if (isCritical && seconds > 0) {
      scale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 300 }), withTiming(1, { duration: 300 })),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 150 });
    }

    return () => {
      cancelAnimation(scale);
    };
  }, [isCritical, seconds, scale]);

  // Handle expiration
  useEffect(() => {
    if (seconds === 0 && !hasExpired.current) {
      hasExpired.current = true;
      onExpire();
    }
  }, [seconds, onExpire]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Urgency-based colors
  const bgColor = isCritical ? 'bg-red-100' : isUrgent ? 'bg-amber-100' : 'bg-gray-100';

  const textColor = isCritical ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-gray-700';

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text
          className={`text-lg font-bold ${textColor}`}
          accessibilityLabel={`${minutes} minutes and ${secs} seconds remaining`}
          accessibilityRole="timer">
          {timeString}
        </Text>
      </View>
    </Animated.View>
  );
}
