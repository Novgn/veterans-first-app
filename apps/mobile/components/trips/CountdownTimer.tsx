/**
 * CountdownTimer component for displaying time remaining on ride offers
 *
 * Features:
 * - Displays minutes:seconds format
 * - Surface tone escalates with urgency for this genuine offer-expiry deadline
 *   (calm stone -> warning -> error); the time text stays in on-surface ink
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

  // Veteran Honor: this is a genuine offer-expiry deadline, so escalating from a
  // calm stone resting state → warning → error (the one place a countdown earns a
  // warning tone). Text always renders in on-surface ink (≥7:1) for legibility.
  const bgColor = isCritical ? 'bg-error-100' : isUrgent ? 'bg-warning-100' : 'bg-background';

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      <View className={`rounded-full px-3 py-1 ${bgColor}`}>
        <Text
          className="font-sans-semibold text-headline text-foreground"
          accessibilityLabel={`${minutes} minutes and ${secs} seconds remaining`}
          accessibilityRole="timer">
          {timeString}
        </Text>
      </View>
    </Animated.View>
  );
}
