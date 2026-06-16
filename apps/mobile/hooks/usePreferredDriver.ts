/**
 * usePreferredDriver Hook
 *
 * Manages the user's default preferred driver preference.
 * Provides query for fetching and mutation for updating.
 *
 * Story 2.7: Implement Preferred Driver Selection (AC #3)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';
import { DriverCardDriver } from '@/components/drivers/DriverCard';

import { useSupabaseUserId } from './useSupabaseUserId';

/**
 * Preferred driver data returned from query
 */
export interface PreferredDriverData {
  /** Preferred driver ID (null if no preference) */
  preferredDriverId: string | null;
  /** Driver data if preference is set */
  driver: DriverCardDriver | null;
}

/**
 * Query key factory for preferred driver queries
 */
export const preferredDriverKeys = {
  all: ['preferredDriver'] as const,
  detail: (userId: string) => [...preferredDriverKeys.all, userId] as const,
};

/**
 * Hook to fetch and manage user's default preferred driver.
 *
 * @param userId - The user's ID
 * @returns Query result with preferred driver data and mutation for updates
 *
 * @example
 * ```typescript
 * const { preferredDriver, updatePreferredDriver, clearPreferredDriver } = usePreferredDriver(userId);
 *
 * // Update preferred driver
 * await updatePreferredDriver.mutateAsync('driver-123');
 *
 * // Clear preference
 * await clearPreferredDriver.mutateAsync();
 * ```
 */
export function usePreferredDriver(_legacyUserId?: string | undefined) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  // `rider_preferences.user_id` is a UUID FK to users.id. Callers previously
  // passed Clerk's string user ID which Postgres rejects as an invalid UUID.
  // Resolve the current user's internal Supabase UUID here and ignore any
  // legacy userId arg.
  const { data: supabaseUserId } = useSupabaseUserId();

  // Query for current preferred driver
  const query = useQuery({
    queryKey: preferredDriverKeys.detail(supabaseUserId ?? ''),
    queryFn: async (): Promise<PreferredDriverData> => {
      if (!supabaseUserId) {
        return { preferredDriverId: null, driver: null };
      }

      // First, get the user's rider preferences
      const { data: prefs, error: prefsError } = await supabase
        .from('rider_preferences')
        .select('default_preferred_driver_id')
        .eq('user_id', supabaseUserId)
        .maybeSingle();

      if (prefsError) {
        throw new Error(`Failed to fetch preferences: ${prefsError.message}`);
      }

      // If no preferences or no preferred driver set
      if (!prefs?.default_preferred_driver_id) {
        return { preferredDriverId: null, driver: null };
      }

      const driverId = prefs.default_preferred_driver_id;

      // Fetch driver details with profile
      const { data: driverData, error: driverError } = await supabase
        .from('users')
        .select(
          `
          id,
          first_name,
          profile_photo_url,
          driver_profile:driver_profiles (
            vehicle_make,
            vehicle_model,
            vehicle_color
          )
        `
        )
        .eq('id', driverId)
        .single();

      if (driverError) {
        // Driver may have been deleted
        return { preferredDriverId: driverId, driver: null };
      }

      // Type assertion for Supabase join result
      const profile = driverData.driver_profile as
        | {
            vehicle_make: string;
            vehicle_model: string;
            vehicle_color: string;
          }[]
        | null;

      const firstProfile = profile?.[0];
      if (!firstProfile) {
        return { preferredDriverId: driverId, driver: null };
      }

      return {
        preferredDriverId: driverId,
        driver: {
          id: driverData.id,
          firstName: driverData.first_name,
          profilePhotoUrl: driverData.profile_photo_url,
          vehicleMake: firstProfile.vehicle_make,
          vehicleModel: firstProfile.vehicle_model,
          vehicleColor: firstProfile.vehicle_color,
        },
      };
    },
    enabled: !!supabaseUserId,
  });

  // Mutation to update preferred driver
  const updateMutation = useMutation({
    mutationFn: async (driverId: string | null) => {
      if (!supabaseUserId) throw new Error('User ID required');

      // Upsert rider preferences
      const { error } = await supabase.from('rider_preferences').upsert(
        {
          user_id: supabaseUserId,
          default_preferred_driver_id: driverId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        throw new Error(`Failed to update preferred driver: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: preferredDriverKeys.detail(supabaseUserId ?? ''),
      });
    },
  });

  return {
    /** Current preferred driver data */
    preferredDriver: query.data,
    /** Loading state */
    isLoading: query.isLoading,
    /** Error state */
    error: query.error,
    /** Mutation to update preferred driver */
    updatePreferredDriver: updateMutation,
    /** Convenience function to clear preference */
    clearPreferredDriver: {
      mutateAsync: () => updateMutation.mutateAsync(null),
      isPending: updateMutation.isPending,
    },
  };
}
