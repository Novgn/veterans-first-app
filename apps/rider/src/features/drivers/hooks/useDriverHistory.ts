/**
 * useDriverHistory Hook
 *
 * Fetches the rider's driver history (drivers they've completed rides with).
 * Returns driver info with ride count and last ride date.
 *
 * Story 2.7: Implement Preferred Driver Selection (AC #1, #4)
 */

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';
import { DriverCardDriver } from '../components/DriverCard';

/**
 * Driver history item with relationship data
 */
export interface DriverHistoryItem {
  /** Driver data for display */
  driver: DriverCardDriver;
  /** Number of completed rides with this driver */
  rideCount: number;
  /** ISO date string of last ride */
  lastRideDate: string;
}

/**
 * Query key factory for driver history queries
 */
export const driverHistoryKeys = {
  all: ['driverHistory'] as const,
  list: (riderId: string) => [...driverHistoryKeys.all, riderId] as const,
};

/**
 * Hook to fetch rider's driver history.
 *
 * Queries completed rides grouped by driver, returning driver info
 * with ride count and last ride date. Results are sorted by ride count
 * (most rides first).
 *
 * @param riderId - The rider's user ID
 * @returns Query result with driver history data
 *
 * @example
 * ```typescript
 * const { data: driverHistory, isLoading } = useDriverHistory(userId);
 *
 * // driverHistory contains drivers sorted by ride count
 * driverHistory?.[0].driver.firstName // "Dave"
 * driverHistory?.[0].rideCount // 23
 * ```
 */
export function useDriverHistory(riderId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: driverHistoryKeys.list(riderId ?? ''),
    queryFn: async (): Promise<DriverHistoryItem[]> => {
      if (!riderId) return [];

      // Query completed rides with driver and vehicle info
      // Note: Uses Supabase joins to get driver profile data
      const { data, error } = await supabase
        .from('rides')
        .select(
          `
          driver_id,
          scheduled_pickup_time,
          driver:users!rides_driver_id_fkey (
            id,
            first_name,
            profile_photo_url
          ),
          driver_profile:driver_profiles (
            vehicle_make,
            vehicle_model,
            vehicle_color
          )
        `
        )
        .eq('rider_id', riderId)
        .eq('status', 'completed')
        .not('driver_id', 'is', null)
        .order('scheduled_pickup_time', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch driver history: ${error.message}`);
      }

      // Group by driver and count rides
      const driverMap = new Map<string, DriverHistoryItem>();

      for (const ride of data || []) {
        const driverId = ride.driver_id;
        // Skip if missing required data
        // Type assertion needed due to Supabase join types
        // Supabase returns single object for singular relations
        const driverData = ride.driver as unknown as
          | {
              id: string;
              first_name: string;
              profile_photo_url: string | null;
            }
          | null
          | undefined;
        const profileData = ride.driver_profile as
          | {
              vehicle_make: string;
              vehicle_model: string;
              vehicle_color: string;
            }[]
          | null
          | undefined;

        if (!driverId || !driverData || !profileData || profileData.length === 0) continue;

        const profile = profileData[0];
        if (!profile) continue;

        const existing = driverMap.get(driverId);
        if (existing) {
          existing.rideCount += 1;
        } else {
          driverMap.set(driverId, {
            driver: {
              id: driverId,
              firstName: driverData.first_name,
              profilePhotoUrl: driverData.profile_photo_url,
              vehicleMake: profile.vehicle_make,
              vehicleModel: profile.vehicle_model,
              vehicleColor: profile.vehicle_color,
            },
            rideCount: 1,
            lastRideDate: ride.scheduled_pickup_time,
          });
        }
      }

      // Sort by ride count (most rides first)
      return Array.from(driverMap.values()).sort((a, b) => b.rideCount - a.rideCount);
    },
    enabled: !!riderId,
  });
}
