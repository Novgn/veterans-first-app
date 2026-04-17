/**
 * NoShowTimer — counts up from the driver's arrival time (Story 3.10).
 *
 * The driver can only mark a rider as no-show after the configurable wait
 * window (default 5 minutes). Before the window elapses the button is
 * disabled and shows the remaining time.
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface NoShowTimerProps {
  /** When did the driver mark arrived? (ISO timestamp) */
  arrivedAt: string | null;
  /** Minimum wait in seconds before no-show is allowed (default 300s / 5 min) */
  minWaitSeconds?: number;
  onMarkNoShow: () => void;
  isMarking?: boolean;
  testID?: string;
}

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NoShowTimer({
  arrivedAt,
  minWaitSeconds = 300,
  onMarkNoShow,
  isMarking = false,
  testID,
}: NoShowTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!arrivedAt) return null;

  const arrivedMs = new Date(arrivedAt).getTime();
  const elapsedMs = now - arrivedMs;
  const remainingMs = minWaitSeconds * 1000 - elapsedMs;
  const canMark = remainingMs <= 0;

  return (
    <View className="rounded-xl border border-amber-300 bg-amber-50 p-4" testID={testID}>
      <View className="mb-2 flex-row items-center">
        <Ionicons name="time" size={18} color="#B45309" />
        <Text className="ml-2 text-sm font-semibold text-amber-800">
          {canMark
            ? `Waited ${formatMs(elapsedMs)}`
            : `Wait ${formatMs(remainingMs)} before marking no-show`}
        </Text>
      </View>
      <Pressable
        onPress={onMarkNoShow}
        disabled={!canMark || isMarking}
        className={`min-h-[48px] flex-row items-center justify-center rounded-xl ${
          canMark && !isMarking ? 'bg-red-500' : 'bg-gray-300'
        }`}
        accessibilityLabel="Mark rider as no-show"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canMark || isMarking }}
        testID={`${testID ?? 'no-show-timer'}-button`}>
        <Ionicons name="close-circle" size={20} color="white" />
        <Text className="ml-2 font-bold text-white">Mark No-Show</Text>
      </Pressable>
    </View>
  );
}

export { formatMs };
