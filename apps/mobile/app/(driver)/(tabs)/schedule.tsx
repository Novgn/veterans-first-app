/**
 * Driver Schedule screen (Story 3.7)
 *
 * Lets the driver manage their weekly availability windows:
 *   - List all windows grouped by day
 *   - Toggle a window active/inactive (quick pause without deleting)
 *   - Delete a window outright
 *   - Add a new window (day + start/end time)
 *
 * Each mutation invalidates the availability query so the list refreshes.
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AddAvailabilitySheet, AvailabilityRow } from '@/components/schedule';
import {
  useCreateAvailability,
  useDeleteAvailability,
  useDriverAvailability,
  useUpdateAvailability,
  type AvailabilityWindow,
} from '@/hooks/useDriverAvailability';

export default function ScheduleScreen() {
  const { data: windows = [], isLoading, error } = useDriverAvailability();
  const createMutation = useCreateAvailability();
  const updateMutation = useUpdateAvailability();
  const deleteMutation = useDeleteAvailability();
  const [showAddSheet, setShowAddSheet] = useState(false);

  const handleToggle = async (window: AvailabilityWindow) => {
    try {
      await updateMutation.mutateAsync({ id: window.id, isActive: !window.isActive });
    } catch (err) {
      Alert.alert('Update Failed', err instanceof Error ? err.message : 'Could not update window');
    }
  };

  const handleDelete = (window: AvailabilityWindow) => {
    Alert.alert('Delete Window?', 'This removes the weekly availability window.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(window.id);
          } catch (err) {
            Alert.alert(
              'Delete Failed',
              err instanceof Error ? err.message : 'Could not delete window'
            );
          }
        },
      },
    ]);
  };

  const handleAdd = async (input: {
    dayOfWeek: Parameters<typeof createMutation.mutateAsync>[0]['dayOfWeek'];
    startTime: string;
    endTime: string;
  }) => {
    try {
      await createMutation.mutateAsync(input);
    } catch (err) {
      Alert.alert('Add Failed', err instanceof Error ? err.message : 'Could not add window');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1E40AF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle" size={32} color="#DC2626" />
        <Text className="mt-2 text-lg font-semibold text-foreground">Could not load schedule</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
        <Text className="text-xl font-bold text-foreground">Weekly Availability</Text>
        <Pressable
          onPress={() => setShowAddSheet(true)}
          className="min-h-[48px] min-w-[48px] flex-row items-center justify-center rounded-xl bg-primary px-4"
          accessibilityLabel="Add availability window"
          accessibilityRole="button"
          testID="add-availability-button">
          <Ionicons name="add" size={20} color="white" />
          <Text className="ml-1 font-semibold text-white">Add</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 80 }}>
        {windows.length === 0 ? (
          <View className="mt-12 items-center px-6">
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-foreground">No windows yet</Text>
            <Text className="mt-1 text-center text-gray-600">
              Add a weekly window so dispatch knows when to assign rides to you.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {windows.map((window) => (
              <AvailabilityRow
                key={window.id}
                window={window}
                onToggleActive={handleToggle}
                onDelete={handleDelete}
                testID={`availability-row-${window.id}`}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddAvailabilitySheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSubmit={handleAdd}
        testID="add-availability-sheet"
      />
    </SafeAreaView>
  );
}
