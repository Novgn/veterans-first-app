/**
 * ConfirmationModal Component
 *
 * Extra-large modal for destructive actions requiring confirmation.
 * Used for ride cancellation and other irreversible actions.
 *
 * Features:
 * - Dark overlay (50% opacity)
 * - Warning icon for destructive actions
 * - Optional reason input for cancellations
 * - 56px touch targets for senior-friendly UX
 * - Full accessibility support
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';

interface ConfirmationModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is closed without action */
  onClose: () => void;
  /** Callback when action is confirmed */
  onConfirm: (reason?: string) => void;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Text for confirm button */
  confirmText: string;
  /** Text for cancel/go back button */
  cancelText?: string;
  /** Whether this is a destructive action (red styling) */
  isDestructive?: boolean;
  /** Whether to show reason input field */
  showReasonInput?: boolean;
  /** Placeholder text for reason input */
  reasonPlaceholder?: string;
  /** Whether confirm action is in progress */
  isLoading?: boolean;
}

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Go Back',
  isDestructive = false,
  showReasonInput = false,
  reasonPlaceholder = 'Reason (optional)',
  isLoading = false,
}: ConfirmationModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason || undefined);
    setReason(''); // Reset reason after confirm
  };

  const handleClose = () => {
    setReason(''); // Reset reason on close
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={handleClose}
        accessibilityLabel="Close modal"
        accessibilityRole="button">
        <Pressable
          className="mx-6 w-full max-w-md rounded-2xl bg-white p-6"
          onPress={(e) => e.stopPropagation()}
          accessibilityLabel={title}>
          {/* Warning icon for destructive actions */}
          {isDestructive && (
            <View className="mb-4 items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="warning" size={32} color="#DC2626" />
              </View>
            </View>
          )}

          {/* Title */}
          <Text
            className="text-center text-2xl font-bold text-foreground"
            accessibilityRole="header">
            {title}
          </Text>

          {/* Message */}
          <Text className="mt-2 text-center text-lg text-gray-600">{message}</Text>

          {/* Optional reason input */}
          {showReasonInput && (
            <TextInput
              className="mt-4 min-h-[56px] rounded-xl border border-gray-300 px-4 text-lg"
              placeholder={reasonPlaceholder}
              placeholderTextColor="#9CA3AF"
              value={reason}
              onChangeText={setReason}
              accessibilityLabel="Cancellation reason"
              accessibilityHint="Optional field to explain why you are cancelling"
              multiline
              numberOfLines={2}
            />
          )}

          {/* Action buttons */}
          <View className="mt-6 flex-row">
            {/* Cancel/Go Back button */}
            <Pressable
              onPress={handleClose}
              disabled={isLoading}
              className={`mr-3 min-h-[56px] flex-1 items-center justify-center rounded-xl border border-gray-300 active:bg-gray-50 ${isLoading ? 'opacity-50' : ''}`}
              accessibilityLabel={cancelText}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}>
              <Text className="text-lg font-semibold text-gray-700">{cancelText}</Text>
            </Pressable>

            {/* Confirm button */}
            <Pressable
              onPress={handleConfirm}
              disabled={isLoading}
              className={`min-h-[56px] flex-1 items-center justify-center rounded-xl active:opacity-80 ${
                isDestructive ? 'bg-red-600' : 'bg-primary'
              } ${isLoading ? 'opacity-50' : ''}`}
              accessibilityLabel={isLoading ? `${confirmText} in progress` : confirmText}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}>
              <Text className="text-lg font-bold text-white">
                {isLoading ? 'Processing...' : confirmText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
