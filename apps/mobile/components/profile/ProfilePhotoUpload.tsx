/**
 * ProfilePhotoUpload Component
 *
 * Allows riders to select and upload a profile photo.
 * Story 2.12: Implement Rider Profile Management (AC: #5)
 *
 * Features:
 * - Camera and photo library selection
 * - Image resize to 400x400 before upload
 * - Upload to Supabase Storage profile-photos bucket
 * - Loading state during upload
 * - Accessibility support
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View, Pressable, Image, ActivityIndicator, Alert } from 'react-native';

import { useSupabase } from '@/lib/supabase';

interface ProfilePhotoUploadProps {
  /** Current photo URL (null if no photo) */
  currentPhotoUrl: string | null;
  /** Callback when photo is successfully uploaded */
  onPhotoUploaded: (url: string) => void;
  /** User ID for filename */
  userId: string;
  /** Optional test ID */
  testID?: string;
}

/**
 * Profile photo upload component with image picker and Supabase storage.
 * Resizes images to 400x400 and uploads to profile-photos bucket.
 */
export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUploaded,
  userId,
  testID,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = useSupabase();

  const handlePickImage = async () => {
    // Show options: Camera or Photo Library
    Alert.alert('Change Profile Photo', 'Choose a source', [
      {
        text: 'Take Photo',
        onPress: () => launchCamera(),
      },
      {
        text: 'Choose from Library',
        onPress: () => launchLibrary(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take a profile photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      await processAndUploadImage(result.assets[0].uri);
    }
  };

  const launchLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow photo library access to change your profile photo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      await processAndUploadImage(result.assets[0].uri);
    }
  };

  const processAndUploadImage = async (imageUri: string) => {
    if (isUploading) return;

    setIsUploading(true);

    try {
      // Resize image to 400x400
      const manipulated = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to blob using fetch
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileName = `${userId}-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      onPhotoUploaded(publicUrl);
    } catch (error) {
      console.error('Photo upload failed:', error);
      Alert.alert('Upload Failed', 'Could not upload your photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePickImage}
      disabled={isUploading}
      className="items-center"
      accessibilityLabel="Change profile photo"
      accessibilityRole="button"
      accessibilityHint="Opens photo picker to select a new profile photo"
      testID={testID}>
      <View className="relative">
        {currentPhotoUrl ? (
          <Image
            source={{ uri: currentPhotoUrl }}
            className="h-24 w-24 rounded-full"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Ionicons name="person" size={48} color="#1E40AF" />
          </View>
        )}

        {/* Camera badge */}
        <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" testID="upload-loading" />
          ) : (
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          )}
        </View>
      </View>
    </Pressable>
  );
}
