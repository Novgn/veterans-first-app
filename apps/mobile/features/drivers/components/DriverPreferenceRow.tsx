/**
 * DriverPreferenceRow Component
 *
 * Displays selected driver preference in booking confirmation.
 * Shows mini driver info or "Any Available Driver" with tap to change.
 *
 * UX Design Requirements:
 * - Large touch target (full row tappable, 48dp+ min)
 * - Shows driver name/photo or "Any Available" icon
 * - "Change" indicator to show it's tappable
 * - Confirmation shows "Requesting [Driver Name]"
 *
 * Story 2.7: Implement Preferred Driver Selection (AC #2)
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

interface DriverPreferenceRowProps {
  /** Selected driver ID (null = any available) */
  selectedDriverId: string | null;
  /** Selected driver name (null = any available) */
  selectedDriverName: string | null;
  /** Selected driver photo URL */
  selectedDriverPhotoUrl?: string | null;
  /** Handler for tapping the row to change driver */
  onPress: () => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * DriverPreferenceRow displays the selected driver preference in booking flow.
 * Tapping opens the DriverSelectionSheet to change the preference.
 */
export function DriverPreferenceRow({
  selectedDriverId,
  selectedDriverName,
  selectedDriverPhotoUrl,
  onPress,
  testID,
}: DriverPreferenceRowProps) {
  const hasDriver = selectedDriverId !== null && selectedDriverName !== null;

  const accessibilityLabel = hasDriver
    ? `Requesting ${selectedDriverName}. Tap to change driver preference.`
    : 'Any available driver. Tap to request a specific driver.';

  return (
    <Pressable
      onPress={onPress}
      className="min-h-[64px] flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Opens driver selection"
      testID={testID}>
      <View className="flex-1 flex-row items-center">
        {/* Driver Icon/Photo */}
        {hasDriver ? (
          selectedDriverPhotoUrl ? (
            <Image
              source={{ uri: selectedDriverPhotoUrl }}
              className="mr-3 h-12 w-12 rounded-full"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="person" size={24} color="#1E40AF" />
            </View>
          )
        ) : (
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name="people" size={24} color="#6B7280" />
          </View>
        )}

        {/* Driver Info */}
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Driver</Text>
          {hasDriver ? (
            <Text className="text-lg font-semibold text-foreground">
              Requesting {selectedDriverName}
            </Text>
          ) : (
            <Text className="text-lg font-semibold text-foreground">Any Available Driver</Text>
          )}
        </View>
      </View>

      {/* Change Indicator */}
      <View className="ml-2 flex-row items-center">
        <Text className="mr-1 text-base text-primary">Change</Text>
        <Ionicons name="chevron-forward" size={20} color="#1E40AF" />
      </View>
    </Pressable>
  );
}
