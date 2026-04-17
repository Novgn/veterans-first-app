/**
 * useArrivalPhotoUpload — capture + upload an arrival photo (Story 3.9)
 *
 * Flow:
 *   1. Ask for camera permission.
 *   2. Launch camera (no edit, 0.6 quality — smaller is fine for evidence).
 *   3. Resize to max 1024px wide JPEG.
 *   4. Upload to `ride-photos` bucket with a deterministic filename.
 *   5. Return the public URL so the caller can attach it to a ride_event.
 *
 * Callers should treat the photo as optional — if the capture is cancelled
 * or fails, the trip transition (arrived / no_show) should still succeed.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { useSupabase } from '@/lib/supabase';

export interface UseArrivalPhotoUploadResult {
  captureAndUpload: (rideId: string) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
}

export function useArrivalPhotoUpload(): UseArrivalPhotoUploadResult {
  const supabase = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureAndUpload = async (rideId: string): Promise<string | null> => {
    setError(null);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.6,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    setIsUploading(true);

    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(manipulated.uri);
      const blob = await response.blob();

      const fileName = `${rideId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('ride-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('ride-photos').getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { captureAndUpload, isUploading, error };
}
