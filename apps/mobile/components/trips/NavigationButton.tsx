/**
 * NavigationButton — launches the device's maps app for turn-by-turn
 * directions to the given address (Story 3.5).
 *
 * Tries the platform deep link first (Apple Maps on iOS, Google Maps on
 * Android). If that link can't be opened (provider missing, permission, sim
 * without maps app), falls back to the https Google Maps URL which every
 * browser/webview can handle.
 */

import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, Text } from 'react-native';

import { buildNavigationUrl, type NavigationTarget } from '@/lib/navigationUrl';

export interface NavigationButtonProps extends NavigationTarget {
  /** What the user is navigating to (pickup vs dropoff). Controls the label. */
  label: string;
  testID?: string;
}

export function NavigationButton({ label, address, lat, lng, testID }: NavigationButtonProps) {
  const handlePress = async () => {
    const { primary, fallback } = buildNavigationUrl({ address, lat, lng });
    try {
      const canOpen = await Linking.canOpenURL(primary);
      await Linking.openURL(canOpen ? primary : fallback);
    } catch {
      try {
        await Linking.openURL(fallback);
      } catch {
        Alert.alert('Navigation Unavailable', 'Could not launch maps app.');
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="min-h-[56px] flex-row items-center justify-center rounded-xl bg-blue-600"
      accessibilityLabel={`${label}: ${address}`}
      accessibilityRole="button"
      accessibilityHint="Opens the maps app with turn-by-turn directions"
      testID={testID}>
      <Ionicons name="navigate" size={22} color="white" />
      <Text className="ml-2 text-base font-bold text-white">{label}</Text>
    </Pressable>
  );
}
