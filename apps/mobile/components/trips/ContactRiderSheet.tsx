/**
 * ContactRiderSheet — driver-side action sheet for contacting the rider
 * (Story 3.6). Mirrors the rider-facing ContactDriverSheet.
 *
 * iOS: native ActionSheetIOS (cancel / call / text).
 * Android: custom bottom sheet modal.
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

export interface ContactRiderSheetProps {
  riderName: string;
  riderPhone: string;
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

export function ContactRiderSheet({
  riderName,
  riderPhone,
  visible,
  onClose,
  testID,
}: ContactRiderSheetProps) {
  const handleCall = async () => {
    const url = `tel:${riderPhone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      Alert.alert('Cannot Make Call', 'Phone calls are not available on this device.', [
        { text: 'OK' },
      ]);
    }
  };

  const handleText = async () => {
    const url = `sms:${riderPhone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      Alert.alert('Cannot Send Text', 'SMS is not available on this device.', [{ text: 'OK' }]);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'ios' && visible) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', `Call ${riderName}`, `Text ${riderName}`],
          cancelButtonIndex: 0,
          title: `Contact ${riderName}`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) void handleCall();
          else if (buttonIndex === 2) void handleText();
          else onClose();
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, riderName]);

  if (Platform.OS === 'ios') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}>
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close contact options"
      />
      <View className="rounded-t-3xl bg-white px-6 pb-8 pt-6">
        <Text className="mb-6 text-center text-xl font-bold text-foreground">
          Contact {riderName}
        </Text>

        <Pressable
          onPress={handleCall}
          className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary active:opacity-80"
          accessibilityLabel={`Call ${riderName}`}
          accessibilityRole="button"
          accessibilityHint="Opens phone app to call rider"
          testID="contact-rider-call">
          <Ionicons name="call" size={24} color="#FFFFFF" />
          <Text className="ml-3 text-lg font-bold text-white">Call {riderName}</Text>
        </Pressable>

        <Pressable
          onPress={handleText}
          className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl border-2 border-primary active:bg-primary/5"
          accessibilityLabel={`Text ${riderName}`}
          accessibilityRole="button"
          accessibilityHint="Opens messages app to text rider"
          testID="contact-rider-text">
          <Ionicons name="chatbubble" size={24} color="#1E40AF" />
          <Text className="ml-3 text-lg font-bold text-primary">Text {riderName}</Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          className="min-h-[56px] items-center justify-center rounded-xl active:bg-gray-100"
          accessibilityLabel="Cancel"
          accessibilityRole="button">
          <Text className="text-lg font-medium text-gray-600">Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
