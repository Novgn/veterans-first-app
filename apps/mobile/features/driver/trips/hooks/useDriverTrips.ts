/**
 * Hook for fetching driver's assigned trips with real-time updates
 *
 * Features:
 * - Fetches rides where driver_id matches current user
 * - Joins with rider info and preferences
 * - Real-time subscription for new assignments
 * - Offline caching support via TanStack Query
 */

import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useSupabase } from '../../lib/supabase';

/**
 * Driver trip with full rider information and preferences
 */
export interface DriverTrip {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledPickupTime: string;
  rider: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePhotoUrl: string | null;
  };
  riderPreferences: {
    mobilityAid: string | null;
    needsDoorAssistance: boolean;
    needsPackageAssistance: boolean;
    extraVehicleSpace: boolean;
    specialEquipmentNotes: string | null;
    comfortTemperature: string | null;
    conversationPreference: string | null;
    musicPreference: string | null;
    otherNotes: string | null;
  } | null;
}

/**
 * Query key factory for trip-related queries
 */
export const tripKeys = {
  all: ['driver-trips'] as const,
  list: (driverId: string) => [...tripKeys.all, 'list', driverId] as const,
  detail: (tripId: string) => [...tripKeys.all, 'detail', tripId] as const,
};

// Type for the Supabase ride response
interface RideResponse {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string;
  rider: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile_photo_url: string | null;
  } | null;
  rider_preferences: {
    mobility_aid: string | null;
    needs_door_assistance: boolean | null;
    needs_package_assistance: boolean | null;
    extra_vehicle_space: boolean | null;
    special_equipment_notes: string | null;
    comfort_temperature: string | null;
    conversation_preference: string | null;
    music_preference: string | null;
    other_notes: string | null;
  } | null;
}

/**
 * Hook to fetch driver's assigned trips with real-time updates
 *
 * @returns Query result with driver trips, loading state, and error
 */
export function useDriverTrips() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  // Set up real-time subscription for trip changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`driver:${userId}:trips`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
          filter: `driver_id=eq.${userId}`,
        },
        () => {
          // Invalidate and refetch on any ride change
          queryClient.invalidateQueries({ queryKey: tripKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, queryClient]);

  return useQuery({
    queryKey: tripKeys.list(userId ?? ''),
    queryFn: async (): Promise<DriverTrip[]> => {
      if (!userId) return [];

      // Get driver's internal user ID from clerk_id
      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) {
        return [];
      }

      // Query rides with rider info and preferences
      // Using relationship aliases for the joins
      const { data, error } = await supabase
        .from('rides')
        .select(
          `
          id,
          status,
          pickup_address,
          dropoff_address,
          scheduled_pickup_time,
          rider:users!rider_id (
            id,
            first_name,
            last_name,
            phone,
            profile_photo_url
          ),
          rider_preferences:rider_preferences!inner (
            mobility_aid,
            needs_door_assistance,
            needs_package_assistance,
            extra_vehicle_space,
            special_equipment_notes,
            comfort_temperature,
            conversation_preference,
            music_preference,
            other_notes
          )
        `
        )
        .eq('driver_id', driverUser.id)
        .in('status', ['assigned', 'confirmed'])
        .order('scheduled_pickup_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform snake_case to camelCase
      return ((data as unknown as RideResponse[]) ?? []).map((ride) => ({
        id: ride.id,
        status: ride.status,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        scheduledPickupTime: ride.scheduled_pickup_time,
        rider: {
          id: ride.rider?.id ?? '',
          firstName: ride.rider?.first_name ?? '',
          lastName: ride.rider?.last_name ?? '',
          phone: ride.rider?.phone ?? '',
          profilePhotoUrl: ride.rider?.profile_photo_url ?? null,
        },
        riderPreferences: ride.rider_preferences
          ? {
              mobilityAid: ride.rider_preferences.mobility_aid,
              needsDoorAssistance: ride.rider_preferences.needs_door_assistance ?? false,
              needsPackageAssistance: ride.rider_preferences.needs_package_assistance ?? false,
              extraVehicleSpace: ride.rider_preferences.extra_vehicle_space ?? false,
              specialEquipmentNotes: ride.rider_preferences.special_equipment_notes,
              comfortTemperature: ride.rider_preferences.comfort_temperature,
              conversationPreference: ride.rider_preferences.conversation_preference,
              musicPreference: ride.rider_preferences.music_preference,
              otherNotes: ride.rider_preferences.other_notes,
            }
          : null,
      }));
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}
