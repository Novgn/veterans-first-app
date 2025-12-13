/**
 * useRides Query Hook
 *
 * TanStack Query hook for fetching rides for the current user.
 * Used by My Rides screen to list upcoming and past rides.
 *
 * Features:
 * - Fetches all rides for current user (RLS filtered)
 * - Includes driver info when assigned
 * - Sorted by scheduled_pickup_time descending
 * - Caches with ['rides'] query key
 * - Real-time subscriptions for status updates
 * - Auto-invalidates on ride changes
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { useUser } from '@clerk/clerk-expo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useSupabase } from '../../../lib/supabase';
import type { Ride } from './useRide';
import type { RideWithDriver, DriverInfo } from '../components/RideCard';

/**
 * Raw ride data with driver join from database
 */
interface RideWithDriverJoin {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: Ride['status'];
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string | null;
  created_at: string;
  updated_at: string;
  driver_profile: {
    user_id: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_color: string;
    users: {
      id: string;
      first_name: string;
      profile_photo_url: string | null;
    };
  } | null;
}

/**
 * Query key factory for rides queries
 */
export const ridesKeys = {
  all: ['rides'] as const,
  lists: () => [...ridesKeys.all, 'list'] as const,
  list: (userId: string) => [...ridesKeys.lists(), userId] as const,
};

/**
 * Hook for fetching all rides for the current user with driver info.
 *
 * Includes real-time subscriptions that automatically invalidate
 * the query when ride data changes in the database.
 *
 * @returns Query result with rides array (including driver info), loading state, and error
 *
 * @example
 * ```typescript
 * const { data: rides, isLoading, refetch } = useRides();
 *
 * if (isLoading) return <Loading />;
 * return <RidesList rides={rides} />;
 * ```
 */
export function useRides() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // User-scoped query key for cache isolation
  const queryKey = user?.id ? ridesKeys.list(user.id) : ridesKeys.all;

  // Set up real-time subscription for ride updates with optimistic cache updates
  useEffect(() => {
    if (!user?.id) return;

    const userQueryKey = ridesKeys.list(user.id);

    const channel = supabase
      .channel(`rides:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `rider_id=eq.${user.id}`,
        },
        (payload) => {
          // Optimistic update: directly update the cache for status changes
          queryClient.setQueryData<RideWithDriver[]>(userQueryKey, (oldData) => {
            if (!oldData) return oldData;
            const updatedRide = payload.new as RideWithDriverJoin;
            return oldData.map((ride) =>
              ride.id === updatedRide.id
                ? { ...ride, status: updatedRide.status as Ride['status'] }
                : ride
            );
          });
          // Also invalidate to ensure driver info is fresh
          queryClient.invalidateQueries({ queryKey: ridesKeys.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rides',
          filter: `rider_id=eq.${user.id}`,
        },
        () => {
          // For new rides, invalidate to fetch complete data with driver info
          queryClient.invalidateQueries({ queryKey: ridesKeys.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'rides',
          filter: `rider_id=eq.${user.id}`,
        },
        (payload) => {
          // Optimistic removal from cache
          queryClient.setQueryData<RideWithDriver[]>(userQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return oldData.filter((ride) => ride.id !== payload.old.id);
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, user?.id]);

  return useQuery<RideWithDriver[]>({
    queryKey,
    queryFn: async () => {
      // Fetch rides with driver profile and user info
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
            users (
              id,
              first_name,
              profile_photo_url
            )
          )
        `
        )
        .order('scheduled_pickup_time', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include driver info in expected format
      return ((data as RideWithDriverJoin[]) || []).map((ride) => {
        const baseRide: Ride = {
          id: ride.id,
          rider_id: ride.rider_id,
          driver_id: ride.driver_id,
          status: ride.status,
          pickup_address: ride.pickup_address,
          dropoff_address: ride.dropoff_address,
          scheduled_pickup_time: ride.scheduled_pickup_time,
          created_at: ride.created_at,
          updated_at: ride.updated_at,
        };

        // If driver is assigned, include driver info
        if (ride.driver_profile?.users) {
          const driverInfo: DriverInfo = {
            id: ride.driver_profile.users.id,
            firstName: ride.driver_profile.users.first_name,
            profilePhotoUrl: ride.driver_profile.users.profile_photo_url,
            vehicleMake: ride.driver_profile.vehicle_make,
            vehicleModel: ride.driver_profile.vehicle_model,
            vehicleColor: ride.driver_profile.vehicle_color,
          };

          return {
            ...baseRide,
            driver: driverInfo,
          } as RideWithDriver;
        }

        return baseRide as RideWithDriver;
      });
    },
    enabled: !!user?.id,
  });
}
