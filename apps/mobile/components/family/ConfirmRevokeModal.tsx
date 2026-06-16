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
        <View className="w-full max-w-sm rounded-lg bg-card p-6 shadow-overlay">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-error-100">
            <Ionicons name="warning" size={24} color="#A83A35" />
          </View>
          <Text className="mb-2 font-sans-semibold text-headline text-foreground">
            Remove {memberName}?
          </Text>
          <Text className="mb-5 font-sans text-footnote text-ink-secondary">
            They will immediately lose access to your ride information and stop receiving
            notifications. You can re-invite them any time.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={isLoading}
              className="min-h-[48px] flex-1 items-center justify-center rounded-md border-2 border-primary"
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              testID="confirm-revoke-cancel">
              <Text className="font-sans-semibold text-primary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={isLoading}
              className="min-h-[48px] flex-1 items-center justify-center rounded-md bg-error active:opacity-90"
              accessibilityLabel="Remove"
              accessibilityRole="button"
              testID="confirm-revoke-confirm">
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="font-sans-semibold text-white">Remove</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
