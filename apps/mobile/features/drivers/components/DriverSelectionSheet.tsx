/**
 * DriverSelectionSheet Component
 *
 * Bottom sheet modal for selecting a preferred driver.
 * Lists drivers from rider's history with "No Preference" option.
 *
 * UX Design Requirements:
 * - Header: "Request a Driver" with close button
 * - "No Preference" option at top
 * - DriverCard for each driver, tappable to select
 * - Current selection highlighted
 * - 48dp+ touch targets
 *
 * Story 2.7: Implement Preferred Driver Selection (AC #1, #2, #5)
 */

import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useDriverHistory } from '../hooks/useDriverHistory';

import { DriverCard } from './DriverCard';

interface DriverSelectionSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Handler for closing the sheet */
  onClose: () => void;
  /** Handler for driver selection - driverId is null for "No Preference" */
  onSelect: (driverId: string | null, driverName: string | null) => void;
  /** Currently selected driver ID (null = no preference) */
  selectedDriverId: string | null;
  /** Rider's user ID for fetching driver history */
  riderId: string | undefined;
  /** Optional test ID */
  testID?: string;
}

/**
 * DriverSelectionSheet displays a modal for selecting a preferred driver.
 * Shows drivers the rider has previously ridden with, sorted by ride count.
 */
export function DriverSelectionSheet({
  visible,
  onClose,
  onSelect,
  selectedDriverId,
  riderId,
  testID,
}: DriverSelectionSheetProps) {
  const { data: driverHistory, isLoading } = useDriverHistory(riderId);

  const handleSelectDriver = (driverId: string | null, driverName: string | null) => {
    onSelect(driverId, driverName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}>
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className="max-h-[80%] rounded-t-3xl bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-bold text-foreground">Request a Driver</Text>
            <Pressable
              onPress={onClose}
              className="h-12 w-12 items-center justify-center rounded-full active:bg-gray-100"
              accessibilityLabel="Close driver selection"
              accessibilityRole="button"
              testID="driver-selection-close">
              <Ionicons name="close" size={28} color="#374151" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
            {/* No Preference Option */}
            <Pressable
              onPress={() => handleSelectDriver(null, null)}
              className={`mb-4 min-h-[80px] flex-row items-center rounded-2xl p-4 ${
                selectedDriverId === null
                  ? 'border-2 border-primary bg-primary/5'
                  : 'border border-gray-200 bg-white'
              } shadow-sm active:bg-gray-50`}
              accessibilityLabel={`Any available driver, no preference${selectedDriverId === null ? ', selected' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedDriverId === null }}
              testID="no-preference-option">
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="people" size={32} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">Any Available Driver</Text>
                <Text className="mt-1 text-base text-gray-600">
                  We&apos;ll assign the best available driver
                </Text>
              </View>
              {selectedDriverId === null && (
                <Ionicons name="checkmark-circle" size={28} color="#1E40AF" />
              )}
            </Pressable>

            {/* Loading State */}
            {isLoading && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#1E40AF" />
                <Text className="mt-4 text-base text-gray-500">Loading your drivers...</Text>
              </View>
            )}

            {/* Driver History */}
            {!isLoading && driverHistory && driverHistory.length > 0 && (
              <>
                <Text className="mb-3 text-lg font-semibold text-gray-600">Your Drivers</Text>
                {driverHistory.map((item) => (
                  <View key={item.driver.id} className="mb-3">
                    <DriverCard
                      driver={item.driver}
                      rideCount={item.rideCount}
                      lastRideDate={item.lastRideDate}
                      isSelected={selectedDriverId === item.driver.id}
                      onPress={() => handleSelectDriver(item.driver.id, item.driver.firstName)}
                      testID={`driver-card-${item.driver.id}`}
                    />
                  </View>
                ))}
              </>
            )}

            {/* Empty State */}
            {!isLoading && driverHistory?.length === 0 && (
              <View className="items-center py-8">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="car-outline" size={40} color="#9CA3AF" />
                </View>
                <Text className="text-center text-lg font-medium text-gray-600">
                  No ride history yet
                </Text>
                <Text className="mt-2 px-8 text-center text-base text-gray-500">
                  After completing rides, your drivers will appear here for easy selection.
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
