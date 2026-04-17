/**
 * ContactDriverSheet Component
 *
 * Action sheet for contacting the assigned driver via phone call or text.
 * Uses native ActionSheetIOS on iOS and custom bottom sheet modal on Android.
 *
 * Features:
 * - Call driver via native phone app
 * - Text driver via native SMS app
 * - Error handling for devices without phone/SMS capability
 * - Full accessibility support with proper labels and hints
 * - 48dp+ touch targets for all interactive elements
 *
 * Story 2.11: Implement Contact Driver Feature
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

export interface ContactDriverSheetProps {
  /** Driver's first name to display */
  driverName: string;
  /** Driver's phone number for call/text */
  driverPhone: string;
  /** Whether the sheet is visible */
  visible: boolean;
  /** Callback when sheet is closed */
  onClose: () => void;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * ContactDriverSheet displays options to call or text the assigned driver.
 * On iOS, uses native ActionSheetIOS. On Android, uses a custom bottom sheet modal.
 */
export function ContactDriverSheet({
  driverName,
  driverPhone,
  visible,
  onClose,
  testID,
}: ContactDriverSheetProps) {
  /**
   * Handle phone call to driver
   */
  const handleCall = async () => {
    const url = `tel:${driverPhone}`;
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

  /**
   * Handle SMS to driver
   */
  const handleText = async () => {
    const url = `sms:${driverPhone}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      Alert.alert('Cannot Send Text', 'SMS is not available on this device.', [{ text: 'OK' }]);
    }
  };

  // Use ActionSheetIOS on iOS for native feel
  useEffect(() => {
    if (Platform.OS === 'ios' && visible) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', `Call ${driverName}`, `Text ${driverName}`],
          cancelButtonIndex: 0,
          title: `Contact ${driverName}`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCall();
          } else if (buttonIndex === 2) {
            handleText();
          } else {
            onClose();
          }
        }
      );
    }
  }, [visible, driverName]);

  // iOS uses ActionSheetIOS, so return null
  if (Platform.OS === 'ios') {
    return null;
  }

  // Custom bottom sheet for Android
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}>
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close contact options"
      />

      {/* Bottom Sheet Content */}
      <View className="rounded-t-3xl bg-white px-6 pb-8 pt-6">
        <Text className="mb-6 text-center text-xl font-bold text-foreground">
          Contact {driverName}
        </Text>

        {/* Call Button */}
        <Pressable
          onPress={handleCall}
          className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary active:opacity-80"
          accessibilityLabel={`Call ${driverName}`}
          accessibilityRole="button"
          accessibilityHint="Opens phone app to call driver">
          <Ionicons name="call" size={24} color="#FFFFFF" />
          <Text className="ml-3 text-lg font-bold text-white">Call {driverName}</Text>
        </Pressable>

        {/* Text Button */}
        <Pressable
          onPress={handleText}
          className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl border-2 border-primary active:bg-primary/5"
          accessibilityLabel={`Text ${driverName}`}
          accessibilityRole="button"
          accessibilityHint="Opens messages app to text driver">
          <Ionicons name="chatbubble" size={24} color="#1E40AF" />
          <Text className="ml-3 text-lg font-bold text-primary">Text {driverName}</Text>
        </Pressable>

        {/* Cancel Button */}
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
