/**
 * 60-second undo countdown toast (Story 4.2).
 *
 * Used by the rider-side Family Access screen when a revoke has been
 * queued. The countdown updates every second and disappears when the
 * window expires (the consumer is responsible for removing the toast
 * from state at that point).
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface UndoToastProps {
  memberName: string;
  expiresAt: number;
  onUndo: () => void;
  onExpire?: () => void;
}

export function UndoToast({ memberName, expiresAt, onUndo, onExpire }: UndoToastProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const next = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0) {
        onExpire?.();
        return;
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [expiresAt, onExpire]);

  if (secondsLeft === 0) return null;

  return (
    <View
      className="mx-6 mb-6 flex-row items-center rounded-xl bg-gray-900 px-4 py-3 shadow-lg"
      testID="family-revoke-undo-toast">
      <Ionicons name="information-circle" size={20} color="#ffffff" />
      <View className="ml-3 flex-1">
        <Text className="font-semibold text-white">{memberName} removed</Text>
        <Text className="text-xs text-gray-300">Undo ({secondsLeft}s)</Text>
      </View>
      <Pressable
        onPress={onUndo}
        className="min-h-[44px] items-center justify-center rounded-lg bg-primary px-4"
        accessibilityLabel={`Undo removing ${memberName}`}
        accessibilityRole="button"
        testID="family-revoke-undo-button">
        <Text className="font-semibold text-white">Undo</Text>
      </Pressable>
    </View>
  );
}
