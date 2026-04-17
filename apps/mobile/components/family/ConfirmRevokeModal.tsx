/**
 * Confirmation modal for revoking family access (Story 4.1, expanded in 4.2).
 *
 * Story 4.1 covers the immediate confirm. Story 4.2 wraps the revoke
 * action in an undo window via UndoToast — this component stays generic.
 */

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

export interface ConfirmRevokeModalProps {
  visible: boolean;
  memberName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmRevokeModal({
  visible,
  memberName,
  onCancel,
  onConfirm,
  isLoading,
}: ConfirmRevokeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Ionicons name="warning" size={24} color="#DC2626" />
          </View>
          <Text className="mb-2 text-lg font-semibold text-foreground">Remove {memberName}?</Text>
          <Text className="mb-5 text-sm text-gray-600">
            They will immediately lose access to your ride information and stop receiving
            notifications. You can re-invite them any time.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              className="min-h-[48px] flex-1 items-center justify-center rounded-lg border border-gray-300"
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              testID="confirm-revoke-cancel">
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={isLoading}
              className="min-h-[48px] flex-1 items-center justify-center rounded-lg bg-red-600"
              accessibilityLabel="Remove"
              accessibilityRole="button"
              testID="confirm-revoke-confirm">
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="font-semibold text-white">Remove</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
