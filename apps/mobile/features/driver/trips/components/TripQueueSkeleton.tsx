/**
 * TripQueueSkeleton component
 *
 * Displays loading skeleton while trip queue is being fetched.
 */

import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface TripQueueSkeletonProps {
  count?: number;
  testID?: string;
}

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
      {/* Header skeleton */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="h-6 w-32 rounded-md bg-gray-200" />
        <View className="h-6 w-20 rounded-full bg-gray-200" />
      </View>

      {/* Rider info skeleton */}
      <View className="mb-3 flex-row items-center">
        <View className="h-12 w-12 rounded-full bg-gray-200" />
        <View className="ml-3 flex-1">
          <View className="h-5 w-32 rounded-md bg-gray-200" />
          <View className="mt-2 h-4 w-24 rounded-md bg-gray-200" />
        </View>
      </View>

      {/* Address skeleton */}
      <View className="mb-2">
        <View className="flex-row items-center">
          <View className="h-4 w-4 rounded-full bg-gray-200" />
          <View className="ml-2 h-4 flex-1 rounded-md bg-gray-200" />
        </View>
        <View className="my-2 ml-2 h-4 w-px bg-gray-200" />
        <View className="flex-row items-center">
          <View className="h-4 w-4 rounded-full bg-gray-200" />
          <View className="ml-2 h-4 flex-1 rounded-md bg-gray-200" />
        </View>
      </View>
    </Animated.View>
  );
}

export function TripQueueSkeleton({ count = 3, testID }: TripQueueSkeletonProps) {
  return (
    <View testID={testID} accessibilityLabel="Loading trips">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </View>
  );
}
