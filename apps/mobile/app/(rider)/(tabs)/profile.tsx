/**
 * Profile Screen
 *
 * User profile with settings and preferences.
 *
 * Features:
 * - User info display with profile photo
 * - Emergency contact display and edit
 * - Saved Places link
 * - My Drivers section for default preferred driver (Story 2.7)
 * - Sign out
 *
 * Story 2.7: Implement Preferred Driver Selection (AC #3)
 * Story 2.12: Implement Rider Profile Management (AC #1-6)
 */

import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { Header } from '@/components/Header';
import { DriverSelectionSheet } from '@/components/drivers';
import { usePreferredDriver } from '@/hooks/usePreferredDriver';
import { EditProfileSheet, type EditProfileData } from '@/components/profile';
import {
  useProfile,
  useUpdateProfile,
  useAccessibilityPreferences,
  useComfortPreferences,
} from '@/hooks';

export default function Profile() {
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const [showDriverSheet, setShowDriverSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  // Fetch user's profile data - Story 2.12
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();

  // Fetch user's accessibility preferences - Story 2.13
  const { data: accessibilityPrefs } = useAccessibilityPreferences();

  // Fetch user's comfort preferences - Story 2.14
  const { data: comfortPrefs } = useComfortPreferences();

  // Fetch user's default preferred driver - Story 2.7
  const {
    preferredDriver,
    isLoading: isLoadingDriver,
    updatePreferredDriver,
    clearPreferredDriver,
  } = usePreferredDriver(userId ?? undefined);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSelectDriver = (driverId: string | null) => {
    updatePreferredDriver.mutate(driverId);
  };

  const handleClearDriver = () => {
    clearPreferredDriver.mutateAsync();
  };

  const handleSaveProfile = async (data: EditProfileData) => {
    await updateProfile.mutateAsync({
      profile_photo_url: data.profilePhotoUrl,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_phone: data.emergencyContactPhone,
      emergency_contact_relationship: data.emergencyContactRelationship,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="mb-6 text-2xl font-bold text-foreground">Profile</Text>

        {/* User Info Card with Profile Photo - Story 2.12 */}
        <View className="mb-6 items-center rounded-xl bg-white p-6 shadow-sm">
          {isLoadingProfile ? (
            <View className="mb-4 h-20 w-20 items-center justify-center">
              <ActivityIndicator size="large" color="#1E40AF" />
            </View>
          ) : profile?.profile_photo_url ? (
            <Image
              source={{ uri: profile.profile_photo_url }}
              className="mb-4 h-20 w-20 rounded-full"
              accessibilityLabel="Your profile photo"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <Ionicons name="person" size={40} color="#1E40AF" />
            </View>
          )}
          <Text className="text-xl font-semibold text-foreground">
            {user?.firstName || 'Rider'}
          </Text>
          {user?.primaryPhoneNumber?.phoneNumber && (
            <Text className="mt-1 text-base text-gray-500">
              {user.primaryPhoneNumber.phoneNumber}
            </Text>
          )}

          {/* Edit Profile Button */}
          <Pressable
            onPress={() => setShowEditSheet(true)}
            className="mt-4 min-h-[44px] flex-row items-center justify-center rounded-lg bg-primary/10 px-6"
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            accessibilityHint="Opens profile editor"
            testID="edit-profile-button">
            <Ionicons name="pencil" size={18} color="#1E40AF" />
            <Text className="ml-2 font-semibold text-primary">Edit Profile</Text>
          </Pressable>
        </View>

        {/* Emergency Contact Section - Story 2.12 */}
        <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">Emergency Contact</Text>
            <Pressable
              onPress={() => setShowEditSheet(true)}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
              accessibilityLabel="Edit emergency contact"
              accessibilityRole="button">
              <Ionicons name="pencil" size={18} color="#1E40AF" />
            </Pressable>
          </View>

          {isLoadingProfile ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#1E40AF" />
            </View>
          ) : profile?.emergency_contact_name ? (
            <View>
              <View className="mb-2 flex-row items-center">
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text className="ml-2 text-base text-foreground">
                  {profile.emergency_contact_name}
                </Text>
                {profile.emergency_contact_relationship && (
                  <Text className="ml-2 text-sm text-gray-500">
                    ({profile.emergency_contact_relationship})
                  </Text>
                )}
              </View>
              {profile.emergency_contact_phone && (
                <View className="flex-row items-center">
                  <Ionicons name="call" size={16} color="#6B7280" />
                  <Text className="ml-2 text-base text-foreground">
                    {profile.emergency_contact_phone}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text className="mb-3 text-base text-gray-600">
                Add an emergency contact who can be reached during your rides.
              </Text>
              <Pressable
                onPress={() => setShowEditSheet(true)}
                className="min-h-[48px] flex-row items-center justify-center rounded-lg bg-primary/10"
                accessibilityLabel="Add emergency contact"
                accessibilityRole="button">
                <Ionicons name="person-add" size={20} color="#1E40AF" />
                <Text className="ml-2 font-semibold text-primary">Add Emergency Contact</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View className="mb-6 rounded-xl bg-white shadow-sm">
          {/* Saved Places Menu Item */}
          <Link href="/profile/saved-places" asChild>
            <Pressable
              className="h-[56px] flex-row items-center justify-between border-b border-gray-100 px-4"
              accessibilityLabel="Saved Places"
              accessibilityRole="button"
              accessibilityHint="Navigate to your saved places">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Ionicons name="location" size={20} color="#1E40AF" />
                </View>
                <Text className="text-lg font-medium text-foreground">Saved Places</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </Link>

          {/* Accessibility Preferences - Story 2.13 */}
          <Link href="/profile/accessibility-preferences" asChild>
            <Pressable
              className="min-h-[56px] flex-row items-center justify-between border-b border-gray-100 px-4"
              accessibilityLabel="Accessibility Preferences"
              accessibilityRole="button"
              accessibilityHint="Navigate to accessibility preferences">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Ionicons name="accessibility" size={20} color="#7C3AED" />
                </View>
                <View>
                  <Text className="text-lg font-medium text-foreground">
                    Accessibility Preferences
                  </Text>
                  {accessibilityPrefs?.mobilityAid && accessibilityPrefs.mobilityAid !== 'none' ? (
                    <Text className="text-sm text-gray-500">
                      {accessibilityPrefs.mobilityAid
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                      {accessibilityPrefs.needsDoorAssistance && ' + door help'}
                    </Text>
                  ) : accessibilityPrefs?.needsDoorAssistance ||
                    accessibilityPrefs?.needsPackageAssistance ||
                    accessibilityPrefs?.extraVehicleSpace ? (
                    <Text className="text-sm text-gray-500">Assistance configured</Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center">
                {(accessibilityPrefs?.mobilityAid ||
                  accessibilityPrefs?.needsDoorAssistance ||
                  accessibilityPrefs?.needsPackageAssistance ||
                  accessibilityPrefs?.extraVehicleSpace) && (
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                )}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          </Link>

          {/* Comfort Preferences - Story 2.14 */}
          <Link href="/profile/comfort-preferences" asChild>
            <Pressable
              className="min-h-[56px] flex-row items-center justify-between border-b border-gray-100 px-4"
              accessibilityLabel="Comfort Preferences"
              accessibilityRole="button"
              accessibilityHint="Navigate to comfort preferences">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Ionicons name="heart" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-lg font-medium text-foreground">Comfort Preferences</Text>
                  {comfortPrefs?.comfortTemperature ||
                  comfortPrefs?.conversationPreference ||
                  comfortPrefs?.musicPreference ? (
                    <Text className="text-sm text-gray-500">
                      {[
                        comfortPrefs.comfortTemperature &&
                          comfortPrefs.comfortTemperature.charAt(0).toUpperCase() +
                            comfortPrefs.comfortTemperature.slice(1),
                        comfortPrefs.conversationPreference === 'quiet'
                          ? 'Quiet'
                          : comfortPrefs.conversationPreference === 'chatty'
                            ? 'Chatty'
                            : comfortPrefs.conversationPreference === 'some'
                              ? 'Some chat'
                              : null,
                        comfortPrefs.musicPreference === 'none'
                          ? 'No music'
                          : comfortPrefs.musicPreference === 'soft'
                            ? 'Soft music'
                            : comfortPrefs.musicPreference === 'any'
                              ? 'Any music'
                              : null,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center">
                {(comfortPrefs?.comfortTemperature ||
                  comfortPrefs?.conversationPreference ||
                  comfortPrefs?.musicPreference) && (
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                )}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </Pressable>
          </Link>

          {/* Family Access - Story 4.1 */}
          <Link href="/profile/family-access" asChild>
            <Pressable
              className="h-[56px] flex-row items-center justify-between border-b border-gray-100 px-4"
              accessibilityLabel="Family Access"
              accessibilityRole="button"
              accessibilityHint="Manage which family members can view your rides"
              testID="profile-family-access-row">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Ionicons name="people" size={20} color="#EA580C" />
                </View>
                <Text className="text-lg font-medium text-foreground">Family Access</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </Link>

          {/* Notification Settings - Story 4.5 */}
          <Link href="/profile/notifications" asChild>
            <Pressable
              className="h-[56px] flex-row items-center justify-between px-4"
              accessibilityLabel="Notification Settings"
              accessibilityRole="button"
              accessibilityHint="Choose how you receive notifications"
              testID="profile-notifications-row">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                </View>
                <Text className="text-lg font-medium text-foreground">Notification Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </Link>
        </View>

        {/* My Drivers Section - Story 2.7 */}
        <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <Text className="mb-3 text-lg font-semibold text-foreground">My Drivers</Text>

          {isLoadingDriver ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#1E40AF" />
            </View>
          ) : preferredDriver?.driver ? (
            // Show preferred driver
            <View>
              <View className="mb-3 flex-row items-center">
                {preferredDriver.driver.profilePhotoUrl ? (
                  <Image
                    source={{ uri: preferredDriver.driver.profilePhotoUrl }}
                    className="mr-3 h-14 w-14 rounded-full"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Ionicons name="person" size={28} color="#1E40AF" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Default Driver</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {preferredDriver.driver.firstName}
                  </Text>
                  <Text className="text-base text-gray-600">
                    {preferredDriver.driver.vehicleColor} {preferredDriver.driver.vehicleMake}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowDriverSheet(true)}
                  className="min-h-[44px] flex-1 items-center justify-center rounded-lg border border-primary bg-white"
                  accessibilityLabel="Change default driver"
                  accessibilityRole="button">
                  <Text className="font-semibold text-primary">Change</Text>
                </Pressable>
                <Pressable
                  onPress={handleClearDriver}
                  disabled={clearPreferredDriver.isPending}
                  className="min-h-[44px] flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white"
                  accessibilityLabel="Clear default driver preference"
                  accessibilityRole="button">
                  <Text className="font-semibold text-gray-600">
                    {clearPreferredDriver.isPending ? 'Clearing...' : 'Clear'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            // No preferred driver set
            <View>
              <Text className="mb-3 text-base text-gray-600">
                Set a default driver for your rides. They&apos;ll be requested automatically when
                you book.
              </Text>
              <Pressable
                onPress={() => setShowDriverSheet(true)}
                className="min-h-[48px] flex-row items-center justify-center rounded-lg bg-primary/10"
                accessibilityLabel="Set default driver"
                accessibilityRole="button"
                accessibilityHint="Opens driver selection">
                <Ionicons name="person-add" size={20} color="#1E40AF" />
                <Text className="ml-2 font-semibold text-primary">Set Default Driver</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={handleSignOut}
          className="mb-6 h-[56px] flex-row items-center justify-center rounded-xl bg-gray-200"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          accessibilityHint="Signs you out of the app">
          <Ionicons name="log-out-outline" size={24} color="#374151" />
          <Text className="ml-3 text-lg font-semibold text-gray-700">Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* Driver Selection Sheet - Story 2.7 */}
      <DriverSelectionSheet
        visible={showDriverSheet}
        onClose={() => setShowDriverSheet(false)}
        onSelect={(driverId, _driverName) => {
          handleSelectDriver(driverId);
        }}
        selectedDriverId={preferredDriver?.preferredDriverId ?? null}
        riderId={userId ?? undefined}
        testID="profile-driver-selection-sheet"
      />

      {/* Edit Profile Sheet - Story 2.12 */}
      <EditProfileSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        onSave={handleSaveProfile}
        initialData={{
          profilePhotoUrl: profile?.profile_photo_url ?? null,
          emergencyContactName: profile?.emergency_contact_name ?? null,
          emergencyContactPhone: profile?.emergency_contact_phone ?? null,
          emergencyContactRelationship: profile?.emergency_contact_relationship ?? null,
        }}
        userId={userId ?? ''}
        testID="edit-profile-sheet"
      />
    </SafeAreaView>
  );
}
