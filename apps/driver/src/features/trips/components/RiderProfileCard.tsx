/**
 * RiderProfileCard component
 *
 * Displays full rider profile with:
 * - Photo and name
 * - Contact buttons (call/text)
 * - Accessibility preferences
 * - Comfort preferences
 * - Special notes
 * - Relationship history
 */

import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, Pressable, Linking } from 'react-native';

import { AccessibilityBadges } from './AccessibilityBadges';
import { ComfortBadges } from './ComfortBadges';

interface RiderProfileCardProps {
  rider: {
    firstName: string;
    lastName: string;
    phone: string;
    profilePhotoUrl: string | null;
  };
  preferences: {
    mobilityAid: string | null;
    needsDoorAssistance: boolean;
    needsPackageAssistance: boolean;
    extraVehicleSpace: boolean;
    specialEquipmentNotes: string | null;
    comfortTemperature: string | null;
    conversationPreference: string | null;
    musicPreference: string | null;
    otherNotes: string | null;
  } | null;
  relationshipCount: number;
  testID?: string;
}

export function RiderProfileCard({
  rider,
  preferences,
  relationshipCount,
  testID,
}: RiderProfileCardProps) {
  const riderName = `${rider.firstName} ${rider.lastName}`;
  const initials = `${rider.firstName.charAt(0)}${rider.lastName.charAt(0)}`.toUpperCase();

  const handleCall = () => {
    Linking.openURL(`tel:${rider.phone}`);
  };

  const handleSMS = () => {
    Linking.openURL(`sms:${rider.phone}`);
  };

  const hasAccessibilityNeeds =
    preferences &&
    (preferences.mobilityAid ||
      preferences.needsDoorAssistance ||
      preferences.needsPackageAssistance ||
      preferences.extraVehicleSpace);

  const hasSpecialNotes =
    preferences && (preferences.specialEquipmentNotes || preferences.otherNotes);

  return (
    <View testID={testID} className="rounded-xl bg-white p-4 shadow-sm">
      {/* Header with photo and contact buttons */}
      <View className="mb-4 flex-row items-center">
        {rider.profilePhotoUrl ? (
          <Image
            source={{ uri: rider.profilePhotoUrl }}
            className="h-20 w-20 rounded-full"
            accessibilityLabel={`Photo of ${riderName}`}
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-200">
            <Text className="text-2xl font-bold text-gray-600">{initials}</Text>
          </View>
        )}

        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-foreground">{riderName}</Text>
          {relationshipCount > 0 && (
            <Text className="text-sm text-gray-600">
              You&apos;ve driven {rider.firstName} {relationshipCount} time
              {relationshipCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Contact Buttons */}
      <View className="mb-4 flex-row gap-3">
        <Pressable
          onPress={handleCall}
          className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-xl bg-green-500"
          accessibilityLabel={`Call ${riderName}`}
          accessibilityRole="button">
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text className="ml-2 font-semibold text-white">Call</Text>
        </Pressable>
        <Pressable
          onPress={handleSMS}
          className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-xl bg-blue-500"
          accessibilityLabel={`Text ${riderName}`}
          accessibilityRole="button">
          <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          <Text className="ml-2 font-semibold text-white">Text</Text>
        </Pressable>
      </View>

      {/* Accessibility Preferences */}
      {preferences && (
        <>
          <View className="mb-3">
            <Text className="mb-2 font-semibold text-gray-700">Accessibility Needs</Text>
            {hasAccessibilityNeeds ? (
              <AccessibilityBadges preferences={preferences} size="md" />
            ) : (
              <Text className="text-sm text-gray-500">No special accessibility needs</Text>
            )}
          </View>

          {/* Comfort Preferences */}
          <View className="mb-3">
            <Text className="mb-2 font-semibold text-gray-700">Comfort Preferences</Text>
            <ComfortBadges preferences={preferences} />
          </View>

          {/* Special Notes */}
          {hasSpecialNotes && (
            <View className="rounded-lg bg-amber-50 p-3">
              <Text className="font-semibold text-amber-800">Special Notes</Text>
              {preferences.specialEquipmentNotes && (
                <Text className="mt-1 text-sm text-amber-700">
                  {preferences.specialEquipmentNotes}
                </Text>
              )}
              {preferences.otherNotes && (
                <Text className="mt-1 text-sm text-amber-700">{preferences.otherNotes}</Text>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}
