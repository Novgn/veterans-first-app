/**
 * DeclineReasonSheet component for capturing optional decline reasons
 *
 * Features:
 * - Modal bottom sheet with preset decline reasons
 * - Optional - driver can skip providing a reason
 * - Accessibility-friendly with proper labels
 * - 48dp+ touch targets
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface DeclineReasonSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Called when sheet is closed without submitting */
  onClose: () => void;
  /** Called when decline is submitted with optional reason */
  onSubmit: (reason?: string) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Preset decline reasons
 */
const DECLINE_REASONS = [
  { id: 'schedule', label: 'Schedule conflict', icon: 'calendar-outline' },
  { id: 'distance', label: 'Too far away', icon: 'navigate-outline' },
  { id: 'vehicle', label: 'Vehicle issue', icon: 'car-outline' },
  { id: 'emergency', label: 'Personal emergency', icon: 'alert-circle-outline' },
  { id: 'other', label: 'Other reason', icon: 'ellipsis-horizontal-outline' },
] as const;

type DeclineReasonId = (typeof DECLINE_REASONS)[number]['id'];

/**
 * Bottom sheet for selecting optional decline reason
 */
export function DeclineReasonSheet({
  visible,
  onClose,
  onSubmit,
  testID,
}: DeclineReasonSheetProps) {
  const [selectedReason, setSelectedReason] = useState<DeclineReasonId | null>(null);

  const handleSubmit = () => {
    const reason = selectedReason
      ? DECLINE_REASONS.find((r) => r.id === selectedReason)?.label
      : undefined;
    onSubmit(reason);
    setSelectedReason(null);
  };

  const handleSkip = () => {
    onSubmit(undefined);
    setSelectedReason(null);
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      testID={testID}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white p-6">
          {/* Header */}
          <Text className="mb-2 text-xl font-bold text-foreground">Why are you declining?</Text>
          <Text className="mb-4 text-sm text-gray-600">
            This helps dispatch understand driver availability (optional)
          </Text>

          {/* Reason Options */}
          <View className="mb-4">
            {DECLINE_REASONS.map((reason) => (
              <Pressable
                key={reason.id}
                onPress={() => setSelectedReason(reason.id)}
                className={`mb-2 min-h-[56px] flex-row items-center rounded-xl border px-4 ${
                  selectedReason === reason.id
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 bg-white'
                }`}
                accessibilityLabel={reason.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedReason === reason.id }}
                testID={`decline-reason-${reason.id}`}>
                <Ionicons
                  name={reason.icon as any}
                  size={24}
                  color={selectedReason === reason.id ? '#1E40AF' : '#6B7280'}
                />
                <Text
                  className={`ml-3 flex-1 text-base ${
                    selectedReason === reason.id ? 'font-semibold text-primary' : 'text-foreground'
                  }`}>
                  {reason.label}
                </Text>
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#1E40AF" />
                )}
              </Pressable>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4">
            <Pressable
              onPress={handleSkip}
              className="min-h-[48px] flex-1 items-center justify-center rounded-xl border border-gray-300"
              accessibilityLabel="Skip providing reason"
              accessibilityRole="button"
              testID="decline-skip-button">
              <Text className="font-semibold text-gray-600">Skip</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              className="min-h-[48px] flex-1 items-center justify-center rounded-xl bg-red-500"
              accessibilityLabel="Confirm decline"
              accessibilityRole="button"
              testID="decline-confirm-button">
              <Text className="font-semibold text-white">Decline Ride</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
