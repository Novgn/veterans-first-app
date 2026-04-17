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
    <View className="flex-row justify-between border-b border-gray-100 py-2">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value || '—'}</Text>
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
        <ActivityIndicator size="large" color="#1E40AF" />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle" size={32} color="#DC2626" />
        <Text className="mt-2 text-lg font-semibold text-foreground">Could not load profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="border-b border-gray-200 px-4 py-4">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
        </View>

        <View className="px-4 py-4">
          <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center">
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="person" size={32} color="#1E40AF" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  {profile.firstName} {profile.lastName}
                </Text>
                <Text className="text-sm text-gray-600">{profile.phone}</Text>
                {profile.email ? (
                  <Text className="text-sm text-gray-600">{profile.email}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <Text className="mb-2 text-lg font-semibold text-foreground">Vehicle</Text>
            <InfoRow label="Make" value={profile.vehicleMake} />
            <InfoRow label="Model" value={profile.vehicleModel} />
            <InfoRow label="Year" value={profile.vehicleYear} />
            <InfoRow label="Color" value={profile.vehicleColor} />
            <InfoRow label="Plate" value={profile.vehiclePlate} />
          </View>

          {profile.bio || profile.yearsExperience ? (
            <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
              <Text className="mb-2 text-lg font-semibold text-foreground">About</Text>
              <InfoRow label="Years driving" value={profile.yearsExperience} />
              {profile.bio ? (
                <>
                  <Text className="mt-2 text-sm text-gray-600">Bio</Text>
                  <Text className="mt-1 text-sm text-foreground">{profile.bio}</Text>
                </>
              ) : null}
            </View>
          ) : null}

          <Pressable
            onPress={() => setShowEdit(true)}
            className="mb-3 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary"
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            testID="edit-profile-button">
            <Ionicons name="create-outline" size={20} color="white" />
            <Text className="ml-2 text-lg font-semibold text-white">Edit Profile</Text>
          </Pressable>

          <Pressable
            onPress={() => signOut()}
            className="min-h-[56px] flex-row items-center justify-center rounded-xl border border-red-500 bg-white"
            accessibilityLabel="Sign out"
            accessibilityRole="button">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 text-lg font-semibold text-red-500">Sign Out</Text>
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
