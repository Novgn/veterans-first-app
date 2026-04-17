/**
 * useRide Query Hook
 *
 * TanStack Query hook for fetching a single ride by ID.
 * Used by RideDetailScreen and ModifyRideScreen.
 *
 * Features:
 * - Fetches ride with all details including driver info
 * - Caches with ['ride', id] query key
 * - Auto-refetches on window focus
 * - Full TypeScript typing
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

/**
 * Ride data returned from the database
 */
export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status:
    | 'pending'
    | 'confirmed'
    | 'assigned'
    | 'in_progress'
    | 'arrived'
    | 'completed'
    | 'cancelled';
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Driver info attached to a ride
 */
export interface RideDriverInfo {
  id: string;
  firstName: string;
  phone: string;
  profilePhotoUrl: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
}

/**
 * Ride with optional driver info
 */
export interface RideWithDriverInfo extends Ride {
  driver?: RideDriverInfo;
  driverRideCount?: number;
}

/**
 * Raw data from Supabase join
 */
interface RideWithJoin extends Ride {
  driver_profile: {
    user_id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_color: string;
    vehicle_plate: string;
    users: {
      id: string;
      first_name: string;
      phone: string;
      profile_photo_url: string | null;
    };
  } | null;
}

/**
 * Hook for fetching a single ride by ID with driver info.
 *
 * @param rideId - The UUID of the ride to fetch
 * @returns Query result with ride data (including driver info), loading state, and error
 *
 * @example
 * ```typescript
 * const { data: ride, isLoading, error } = useRide('abc-123');
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * return <RideDetails ride={ride} />;
 * ```
 */
export function useRide(rideId: string | undefined) {
  const supabase = useSupabase();

  return useQuery<RideWithDriverInfo | null>({
    queryKey: ['ride', rideId],
    queryFn: async () => {
      if (!rideId) return null;

      // Fetch ride with driver profile and user info (including phone for contact)
      const { data, error } = await supabase
        .from('rides')
        .select(
          `
          *,
          driver_profile:driver_profiles!rides_driver_id_fkey (
            user_id,
            vehicle_make,
            vehicle_model,
            vehicle_color,
            vehicle_plate,
            users (
              id,
              first_name,
              phone,
              profile_photo_url
            )
          )
        `
        )
        .eq('id', rideId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const rideData = data as RideWithJoin;

      // Build base ride
      const ride: RideWithDriverInfo = {
        id: rideData.id,
        rider_id: rideData.rider_id,
        driver_id: rideData.driver_id,
        status: rideData.status,
        pickup_address: rideData.pickup_address,
        dropoff_address: rideData.dropoff_address,
        scheduled_pickup_time: rideData.scheduled_pickup_time,
        created_at: rideData.created_at,
        updated_at: rideData.updated_at,
      };

      // If driver is assigned, add driver info (including phone for contact feature)
      if (rideData.driver_profile?.users) {
        ride.driver = {
          id: rideData.driver_profile.users.id,
          firstName: rideData.driver_profile.users.first_name,
          phone: rideData.driver_profile.users.phone,
          profilePhotoUrl: rideData.driver_profile.users.profile_photo_url,
          vehicleMake: rideData.driver_profile.vehicle_make,
          vehicleModel: rideData.driver_profile.vehicle_model,
          vehicleColor: rideData.driver_profile.vehicle_color,
          vehiclePlate: rideData.driver_profile.vehicle_plate,
        };

        // Get driver ride count for this rider
        const { count } = await supabase
          .from('rides')
          .select('*', { count: 'exact', head: true })
          .eq('rider_id', rideData.rider_id)
          .eq('driver_id', rideData.driver_id)
          .eq('status', 'completed');

        ride.driverRideCount = count ?? 0;
      }

      return ride;
    },
    enabled: !!rideId,
  });
}
