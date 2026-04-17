/**
 * Hook for one-shot GPS capture (Story 3.4)
 *
 * Requests foreground location permission and returns the current coordinates.
 * Designed to be called at each trip status transition so every ride_event
 * carries a lat/lng fingerprint.
 *
 * Returns `null` on permission denial or capture failure — callers should
 * still allow the status transition to proceed (audit requires the timestamp,
 * not necessarily the location).
 */

import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export interface LocationResult {
  lat: number;
  lng: number;
}

export interface UseLocationCaptureResult {
  captureLocation: () => Promise<LocationResult | null>;
  isCapturing: boolean;
  error: string | null;
}

export function useLocationCapture(): UseLocationCaptureResult {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(async (): Promise<LocationResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { captureLocation, isCapturing, error };
}
