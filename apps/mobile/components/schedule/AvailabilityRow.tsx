/**
 * AvailabilityRow — single weekly window (Story 3.7)
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, Switch, Text, View } from 'react-native';

import { DAYS_OF_WEEK, type AvailabilityWindow } from '@/hooks/useDriverAvailability';

export interface AvailabilityRowProps {
  window: AvailabilityWindow;
  onToggleActive: (window: AvailabilityWindow) => void;
  onDelete: (window: AvailabilityWindow) => void;
  testID?: string;
}

function fmtTime(t: string): string {
  // "14:30:00" -> "2:30 PM"
  const [hStr, mStr] = t.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  return `${hour12}:${mm} ${period}`;
}

export function AvailabilityRow({
  window,
  onToggleActive,
  onDelete,
  testID,
}: AvailabilityRowProps) {
  return (
    <View
      className={`flex-row items-center rounded-xl border bg-white p-4 ${
        window.isActive ? 'border-primary/30' : 'border-gray-200'
      }`}
      testID={testID}>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">
          {DAYS_OF_WEEK[window.dayOfWeek]}
        </Text>
        <Text className="mt-1 text-sm text-gray-600">
          {fmtTime(window.startTime)} – {fmtTime(window.endTime)}
        </Text>
      </View>

      <Switch
        value={window.isActive}
        onValueChange={() => onToggleActive(window)}
        accessibilityLabel={`Toggle ${DAYS_OF_WEEK[window.dayOfWeek]} availability`}
        testID={`${testID ?? 'availability-row'}-toggle`}
      />
      <Pressable
        onPress={() => onDelete(window)}
        className="ml-3 min-h-[48px] min-w-[48px] items-center justify-center"
        accessibilityLabel={`Delete ${DAYS_OF_WEEK[window.dayOfWeek]} ${fmtTime(window.startTime)} to ${fmtTime(window.endTime)} window`}
        accessibilityRole="button"
        testID={`${testID ?? 'availability-row'}-delete`}>
        <Ionicons name="trash-outline" size={20} color="#DC2626" />
      </Pressable>
    </View>
  );
}

export { fmtTime };
