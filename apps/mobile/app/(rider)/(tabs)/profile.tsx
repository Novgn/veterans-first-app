/**
 * Profile Screen
 *
 * User profile with settings, preferences, drivers, and account actions.
 *
 * Story 2.7: Preferred Driver Selection (AC #3)
 * Story 2.12: Rider Profile Management (AC #1-6)
 * Story 2.13: Accessibility Preferences
 * Story 2.14: Comfort Preferences
 * Story 4.1: Family Access
 * Story 4.5: Notification Settings
 */

import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { DriverSelectionSheet } from '@/components/drivers';
import { EditProfileSheet, type EditProfileData } from '@/components/profile';
import { AppHeader, Button, Card, ListRow, SectionGroup, SectionHeader } from '@/components/ui';
import {
  useAccessibilityPreferences,
  useComfortPreferences,
  useProfile,
  useUpdateProfile,
} from '@/hooks';
import { usePreferredDriver } from '@/hooks/usePreferredDriver';
import { useSupabaseUserId } from '@/hooks/useSupabaseUserId';

// Veteran Honor icon tints. Brass (accent) is NON-TEXT — used here only as an
// icon tint on the accessibility/family rows. Ink-secondary stands in for the
// muted "stone" leading glyphs.
const PRIMARY = '#1F3A5F'; // navy
const ACCENT_BRASS = '#9A7B3F'; // brass (icon/border only)
const SUCCESS = '#356046'; // success
const STONE = '#4F4A41'; // ink-secondary
const ERROR = '#A83A35'; // error

/** Derive accessibility subtitle from current preferences (Story 2.13). */
function buildAccessibilitySubtitle(
  prefs: ReturnType<typeof useAccessibilityPreferences>['data']
): string | undefined {
  if (!prefs) return undefined;
  if (prefs.mobilityAid && prefs.mobilityAid !== 'none') {
    const label = prefs.mobilityAid.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return prefs.needsDoorAssistance ? `${label} + door help` : label;
  }
  if (prefs.needsDoorAssistance || prefs.needsPackageAssistance || prefs.extraVehicleSpace) {
    return 'Assistance configured';
  }
  return undefined;
}

/** Derive comfort subtitle from current preferences (Story 2.14). */
function buildComfortSubtitle(
  prefs: ReturnType<typeof useComfortPreferences>['data']
): string | undefined {
  if (!prefs) return undefined;
  if (!prefs.comfortTemperature && !prefs.conversationPreference && !prefs.musicPreference) {
    return undefined;
  }
  const parts: string[] = [];
  if (prefs.comfortTemperature) {
    parts.push(
      prefs.comfortTemperature.charAt(0).toUpperCase() + prefs.comfortTemperature.slice(1)
    );
  }
  if (prefs.conversationPreference === 'quiet') parts.push('Quiet');
  else if (prefs.conversationPreference === 'chatty') parts.push('Chatty');
  else if (prefs.conversationPreference === 'some') parts.push('Some chat');
  if (prefs.musicPreference === 'none') parts.push('No music');
  else if (prefs.musicPreference === 'soft') parts.push('Soft music');
  else if (prefs.musicPreference === 'any') parts.push('Any music');
  return parts.length ? parts.join(' \u2022 ') : undefined;
}

export default function Profile() {
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const { data: supabaseUserId } = useSupabaseUserId();
  const [showDriverSheet, setShowDriverSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: accessibilityPrefs } = useAccessibilityPreferences();
  const { data: comfortPrefs } = useComfortPreferences();
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

  const accessibilitySubtitle = buildAccessibilitySubtitle(accessibilityPrefs);
  const comfortSubtitle = buildComfortSubtitle(comfortPrefs);

  const displayName = user?.firstName || 'Rider';
  const phoneNumber = user?.primaryPhoneNumber?.phoneNumber;

  const emergencyName = profile?.emergency_contact_name;
  const emergencyPhone = profile?.emergency_contact_phone;
  const emergencyRelationship = profile?.emergency_contact_relationship;
  const emergencySubtitle = emergencyPhone
    ? emergencyRelationship
      ? `${emergencyPhone} \u00b7 ${emergencyRelationship}`
      : emergencyPhone
    : (emergencyRelationship ?? undefined);

  const driver = preferredDriver?.driver;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader mode="brand" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>
        {/* 1. Profile hero */}
        <Card variant="elevated" padding="lg" className="mb-4 items-center">
          {isLoadingProfile ? (
            <View className="mb-4 h-20 w-20 items-center justify-center">
              <ActivityIndicator size="large" color={PRIMARY} />
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
              <Ionicons name="person" size={40} color={PRIMARY} />
            </View>
          )}
          <Text className="font-sans-semibold text-title-3 text-foreground">{displayName}</Text>
          {phoneNumber ? (
            <Text className="mt-1 font-sans text-footnote text-ink-secondary">{phoneNumber}</Text>
          ) : null}
          <View className="mt-4">
            <Button
              label="Edit profile"
              variant="secondary"
              size="md"
              fullWidth={false}
              leftIcon={<Ionicons name="pencil" size={18} color={PRIMARY} />}
              onPress={() => setShowEditSheet(true)}
              accessibilityHint="Opens profile editor"
              testID="edit-profile-button"
            />
          </View>
        </Card>

        {/* 2. Emergency contact */}
        <SectionHeader title="Emergency contact" />
        <SectionGroup className="mb-6">
          {emergencyName ? (
            <ListRow
              leading={<Ionicons name="person" size={22} color={PRIMARY} />}
              leadingTint="primary"
              title={emergencyName}
              subtitle={emergencySubtitle}
              trailing={<Ionicons name="pencil" size={18} color={PRIMARY} />}
              onPress={() => setShowEditSheet(true)}
              accessibilityHint="Edit emergency contact"
            />
          ) : (
            <ListRow
              leading={<Ionicons name="person-add" size={22} color={PRIMARY} />}
              leadingTint="primary"
              title="Add emergency contact"
              subtitle="Someone we can reach during your rides"
              onPress={() => setShowEditSheet(true)}
              accessibilityHint="Opens profile editor to add emergency contact"
            />
          )}
        </SectionGroup>

        {/* 3. Preferences */}
        <SectionHeader title="Preferences" />
        <SectionGroup className="mb-6">
          <ListRow
            leading={<Ionicons name="location" size={22} color={PRIMARY} />}
            leadingTint="primary"
            title="Saved places"
            onPress={() => router.push('/profile/saved-places')}
            accessibilityHint="Navigate to your saved places"
          />
          <ListRow
            leading={<Ionicons name="accessibility" size={22} color={ACCENT_BRASS} />}
            leadingTint="accent"
            title="Accessibility"
            subtitle={accessibilitySubtitle}
            onPress={() => router.push('/profile/accessibility-preferences')}
            accessibilityHint="Navigate to accessibility preferences"
          />
          <ListRow
            leading={<Ionicons name="heart" size={22} color={SUCCESS} />}
            leadingTint="success"
            title="Comfort"
            subtitle={comfortSubtitle}
            onPress={() => router.push('/profile/comfort-preferences')}
            accessibilityHint="Navigate to comfort preferences"
          />
          <ListRow
            leading={<Ionicons name="notifications" size={22} color={STONE} />}
            leadingTint="stone"
            title="Notifications"
            onPress={() => router.push('/profile/notifications')}
            accessibilityHint="Choose how you receive notifications"
            testID="profile-notifications-row"
          />
        </SectionGroup>

        {/* 4. Drivers */}
        <SectionHeader title="My drivers" />
        <SectionGroup className="mb-6">
          {isLoadingDriver ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color={PRIMARY} />
            </View>
          ) : driver ? (
            <>
              <ListRow
                leading={
                  driver.profilePhotoUrl ? (
                    <Image
                      source={{ uri: driver.profilePhotoUrl }}
                      className="h-10 w-10 rounded-full"
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <Ionicons name="person" size={22} color={PRIMARY} />
                  )
                }
                leadingTint={driver.profilePhotoUrl ? undefined : 'primary'}
                title={`${driver.firstName} (default)`}
                subtitle={`${driver.vehicleColor} ${driver.vehicleMake}`}
                trailing={<Ionicons name="pencil" size={18} color={PRIMARY} />}
                onPress={() => setShowDriverSheet(true)}
                accessibilityHint="Change default driver"
              />
              <ListRow
                leading={<Ionicons name="close-circle-outline" size={22} color={STONE} />}
                leadingTint="stone"
                title={clearPreferredDriver.isPending ? 'Clearing...' : 'Clear default driver'}
                onPress={handleClearDriver}
                disabled={clearPreferredDriver.isPending}
                accessibilityHint="Removes your default driver preference"
              />
            </>
          ) : (
            <ListRow
              leading={<Ionicons name="person-add" size={22} color={PRIMARY} />}
              leadingTint="primary"
              title="Set a default driver"
              subtitle="We'll request them first for every ride"
              onPress={() => setShowDriverSheet(true)}
              accessibilityHint="Opens driver selection"
            />
          )}
        </SectionGroup>

        {/* 5. Family & access */}
        <SectionHeader title="Family & access" />
        <SectionGroup className="mb-6">
          <ListRow
            leading={<Ionicons name="people" size={22} color={ACCENT_BRASS} />}
            leadingTint="accent"
            title="Family access"
            subtitle="Share ride visibility with loved ones"
            onPress={() => router.push('/profile/family-access')}
            accessibilityHint="Manage which family members can view your rides"
            testID="profile-family-access-row"
          />
        </SectionGroup>

        {/* 6. Account */}
        <SectionHeader title="Account" />
        <SectionGroup className="mb-6">
          <ListRow
            leading={<Ionicons name="log-out-outline" size={22} color={STONE} />}
            leadingTint="stone"
            title="Sign out"
            onPress={handleSignOut}
            accessibilityHint="Signs you out of the app"
          />
        </SectionGroup>

        {/* 7. Danger zone */}
        <View className="mt-2">
          <SectionHeader title="Danger zone" />
          <SectionGroup>
            <ListRow
              leading={<Ionicons name="trash-outline" size={22} color={ERROR} />}
              leadingTint="error"
              title="Delete my account"
              destructive
              onPress={() => router.push('/profile/delete-account')}
              accessibilityHint="Opens the account deletion flow"
              testID="profile-delete-account-row"
            />
          </SectionGroup>
        </View>
      </ScrollView>

      {/* Driver Selection Sheet - Story 2.7 */}
      <DriverSelectionSheet
        visible={showDriverSheet}
        onClose={() => setShowDriverSheet(false)}
        onSelect={(driverId, _driverName) => {
          handleSelectDriver(driverId);
        }}
        selectedDriverId={preferredDriver?.preferredDriverId ?? null}
        riderId={supabaseUserId ?? undefined}
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
