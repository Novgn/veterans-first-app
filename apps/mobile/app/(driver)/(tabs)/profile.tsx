/**
 * Driver Profile screen (Story 3.11)
 *
 * Shows personal + vehicle info and opens an EditDriverProfileSheet for
 * edits. Sign-out action is retained.
 */

import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { EditDriverProfileSheet } from '@/components/profile';
import {
  useDriverProfile,
  useUpdateDriverProfile,
  type DriverProfileUpdate,
} from '@/hooks/useDriverProfile';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View className="border-hairline flex-row justify-between border-b py-2">
      <Text className="font-sans text-body text-ink-secondary">{label}</Text>
      <Text className="font-sans-medium text-body text-foreground">{value || '—'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { data: profile, isLoading, error } = useDriverProfile();
  const updateMutation = useUpdateDriverProfile();
  const [showEdit, setShowEdit] = useState(false);

  const handleSubmit = async (input: DriverProfileUpdate) => {
    try {
      await updateMutation.mutateAsync(input);
      setShowEdit(false);
      Alert.alert('Profile Updated', 'Your profile has been saved.');
    } catch (err) {
      Alert.alert('Save Failed', err instanceof Error ? err.message : 'Could not save profile');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1F3A5F" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle" size={32} color="#A83A35" />
        <Text className="mt-2 font-sans-semibold text-headline text-foreground">
          Could not load profile
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="border-hairline border-b px-4 py-4">
          <Text className="font-sans-bold text-title-1 text-foreground">Profile</Text>
        </View>

        <View className="px-4 py-4">
          <View className="border-hairline mb-4 rounded-lg border bg-card p-6 shadow-card">
            <View className="flex-row items-center">
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Ionicons name="person" size={32} color="#1F3A5F" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-title-3 text-foreground">
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text className="font-sans text-body text-ink-secondary">{profile.phone}</Text>
                {profile.email ? (
                  <Text className="font-sans text-body text-ink-secondary">{profile.email}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="border-hairline mb-4 rounded-lg border bg-card p-6 shadow-card">
            <Text className="mb-2 font-sans-semibold text-title-3 text-foreground">Vehicle</Text>
            <InfoRow label="Make" value={profile.vehicleMake} />
            <InfoRow label="Model" value={profile.vehicleModel} />
            <InfoRow label="Year" value={profile.vehicleYear} />
            <InfoRow label="Color" value={profile.vehicleColor} />
            <InfoRow label="Plate" value={profile.vehiclePlate} />
          </View>

          {profile.bio || profile.yearsExperience ? (
            <View className="border-hairline mb-4 rounded-lg border bg-card p-6 shadow-card">
              <Text className="mb-2 font-sans-semibold text-title-3 text-foreground">About</Text>
              <InfoRow label="Years driving" value={profile.yearsExperience} />
              {profile.bio ? (
                <>
                  <Text className="mt-2 font-sans text-body text-ink-secondary">Bio</Text>
                  <Text className="mt-1 font-sans text-body text-foreground">{profile.bio}</Text>
                </>
              ) : null}
            </View>
          ) : null}

          <Pressable
            onPress={() => setShowEdit(true)}
            className="mb-3 min-h-touch-lg flex-row items-center justify-center rounded-md bg-primary active:bg-primary-700"
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            testID="edit-profile-button">
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text className="ml-2 font-sans-semibold text-headline text-white">Edit Profile</Text>
          </Pressable>

          <Pressable
            onPress={() => signOut()}
            className="min-h-touch-lg flex-row items-center justify-center rounded-md border-2 border-error bg-transparent active:bg-error-100"
            accessibilityLabel="Sign out"
            accessibilityRole="button">
            <Ionicons name="log-out-outline" size={20} color="#A83A35" />
            <Text className="ml-2 font-sans-semibold text-headline text-error">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      <EditDriverProfileSheet
        visible={showEdit}
        initial={profile}
        onClose={() => setShowEdit(false)}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        testID="edit-driver-profile-sheet"
      />
    </SafeAreaView>
  );
}
