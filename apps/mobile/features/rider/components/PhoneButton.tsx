import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable } from 'react-native';

import { SUPPORT_PHONE } from '../lib/constants';

export function PhoneButton() {
  const handlePress = async () => {
    const phoneUrl = `tel:${SUPPORT_PHONE}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Unable to Call', `Please call ${SUPPORT_PHONE} to reach support.`, [
        { text: 'OK' },
      ]);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="h-[56px] w-[56px] items-center justify-center rounded-full bg-primary"
      accessibilityLabel="Call support"
      accessibilityRole="button"
      accessibilityHint="Opens your phone to call Veterans 1st support">
      <Ionicons name="call" size={28} color="white" />
    </Pressable>
  );
}
