/**
 * AssistanceToggles Component
 *
 * Toggle switches for assistance preferences.
 * Story 2.13: Implement Accessibility Preferences (AC: #1, #4)
 *
 * Features:
 * - Door assistance toggle
 * - Package assistance toggle
 * - Extra vehicle space toggle
 * - Accessibility support with labels and hints
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Switch } from 'react-native';

interface AssistanceTogglesProps {
  /** Whether rider needs door assistance */
  needsDoorAssistance: boolean;
  /** Whether rider needs package assistance */
  needsPackageAssistance: boolean;
  /** Whether rider needs extra vehicle space */
  extraVehicleSpace: boolean;
  /** Callback for door assistance toggle */
  onDoorAssistanceChange: (value: boolean) => void;
  /** Callback for package assistance toggle */
  onPackageAssistanceChange: (value: boolean) => void;
  /** Callback for extra space toggle */
  onExtraSpaceChange: (value: boolean) => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * Assistance toggles component with three switches.
 * Uses consistent styling with icons and descriptions.
 */
export function AssistanceToggles({
  needsDoorAssistance,
  needsPackageAssistance,
  extraVehicleSpace,
  onDoorAssistanceChange,
  onPackageAssistanceChange,
  onExtraSpaceChange,
  testID,
}: AssistanceTogglesProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Assistance Needed</Text>
      <Text className="mb-4 text-sm text-gray-600">
        Let drivers know what assistance you may need during your ride.
      </Text>

      <View className="gap-4 rounded-xl bg-white p-4 shadow-sm">
        {/* Door Assistance Toggle */}
        <View className="min-h-[48px] flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="home" size={20} color="#1E40AF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">Help to Door</Text>
              <Text className="text-sm text-gray-500">
                Driver assists to/from building entrance
              </Text>
            </View>
          </View>
          <Switch
            value={needsDoorAssistance}
            onValueChange={onDoorAssistanceChange}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={needsDoorAssistance ? '#1E40AF' : '#F3F4F6'}
            accessibilityLabel="Help to door"
            accessibilityHint="Toggle if you need assistance getting to and from the door"
            testID={testID ? `${testID}-door` : undefined}
          />
        </View>

        {/* Package Assistance Toggle */}
        <View className="min-h-[48px] flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Ionicons name="bag-handle" size={20} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">Help with Packages</Text>
              <Text className="text-sm text-gray-500">Driver helps carry bags or belongings</Text>
            </View>
          </View>
          <Switch
            value={needsPackageAssistance}
            onValueChange={onPackageAssistanceChange}
            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
            thumbColor={needsPackageAssistance ? '#059669' : '#F3F4F6'}
            accessibilityLabel="Help with packages"
            accessibilityHint="Toggle if you need help with packages or belongings"
            testID={testID ? `${testID}-packages` : undefined}
          />
        </View>

        {/* Extra Space Toggle */}
        <View className="min-h-[48px] flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Ionicons name="resize" size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">Extra Vehicle Space</Text>
              <Text className="text-sm text-gray-500">Need room for wheelchair or equipment</Text>
            </View>
          </View>
          <Switch
            value={extraVehicleSpace}
            onValueChange={onExtraSpaceChange}
            trackColor={{ false: '#D1D5DB', true: '#C4B5FD' }}
            thumbColor={extraVehicleSpace ? '#7C3AED' : '#F3F4F6'}
            accessibilityLabel="Extra vehicle space"
            accessibilityHint="Toggle if you need extra space for mobility equipment"
            testID={testID ? `${testID}-extra-space` : undefined}
          />
        </View>
      </View>
    </View>
  );
}
