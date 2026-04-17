/**
 * Hook for fetching a single trip with full rider details
 *
 * Fetches a specific ride by ID with:
 * - Full rider profile
 * - Rider preferences (accessibility and comfort)
 */

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

import { tripKeys, type DriverTrip } from './useDriverTrips';

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
 * Hook to fetch a single trip by ID with full rider details
 *
 * @param tripId - The ID of the trip to fetch
 * @returns Query result with trip details
 */
export function useTrip(tripId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: async (): Promise<DriverTrip | null> => {
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
        .eq('id', tripId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      const ride = data as unknown as RideResponse;

      return {
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
      };
    },
    enabled: !!tripId,
    staleTime: 60 * 1000, // 1 minute
  });
}
