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
      <Text className="mb-3 font-sans-semibold text-headline text-foreground">
        Assistance Needed
      </Text>
      <Text className="mb-4 font-sans text-footnote text-ink-secondary">
        Let drivers know what assistance you may need during your ride.
      </Text>

      <View className="border-hairline gap-4 rounded-lg border bg-card p-4 shadow-card">
        {/* Door Assistance Toggle */}
        <View className="min-h-[48px] flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="home" size={20} color="#1F3A5F" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-medium text-body text-foreground">Help to Door</Text>
              <Text className="font-sans text-footnote text-ink-secondary">
                Driver assists to/from building entrance
              </Text>
            </View>
          </View>
          <Switch
            value={needsDoorAssistance}
            onValueChange={onDoorAssistanceChange}
            trackColor={{ false: '#DAD3C6', true: '#1F3A5F' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Help to door"
            accessibilityHint="Toggle if you need assistance getting to and from the door"
            testID={testID ? `${testID}-door` : undefined}
          />
        </View>

        {/* Package Assistance Toggle */}
        <View className="min-h-[48px] flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-secondary-100">
              <Ionicons name="bag-handle" size={20} color="#4A6B54" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-medium text-body text-foreground">Help with Packages</Text>
              <Text className="font-sans text-footnote text-ink-secondary">
                Driver helps carry bags or belongings
              </Text>
            </View>
          </View>
          <Switch
            value={needsPackageAssistance}
            onValueChange={onPackageAssistanceChange}
            trackColor={{ false: '#DAD3C6', true: '#1F3A5F' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Help with packages"
            accessibilityHint="Toggle if you need help with packages or belongings"
            testID={testID ? `${testID}-packages` : undefined}
          />
        </View>

        {/* Extra Space Toggle */}
        <View className="min-h-[48px] flex-row items-center justify-between">
          <View className="mr-4 flex-1 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-accent-100">
              <Ionicons name="resize" size={20} color="#9A7B3F" />
            </View>
            <View className="flex-1">
              <Text className="font-sans-medium text-body text-foreground">
                Extra Vehicle Space
              </Text>
              <Text className="font-sans text-footnote text-ink-secondary">
                Need room for wheelchair or equipment
              </Text>
            </View>
          </View>
          <Switch
            value={extraVehicleSpace}
            onValueChange={onExtraSpaceChange}
            trackColor={{ false: '#DAD3C6', true: '#1F3A5F' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Extra vehicle space"
            accessibilityHint="Toggle if you need extra space for mobility equipment"
            testID={testID ? `${testID}-extra-space` : undefined}
          />
        </View>
      </View>
    </View>
  );
}
