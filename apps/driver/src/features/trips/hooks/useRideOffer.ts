/**
 * Hook for fetching pending ride offers with real-time updates and countdown timer
 *
 * Features:
 * - Queries current pending offer for the driver
 * - Real-time subscription for new offers
 * - Countdown timer for offer expiration
 * - Auto-invalidates when offer expires
 */

import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useSupabase } from '../../../lib/supabase';

/**
 * Ride offer with full ride and rider information
 */
export interface RideOffer {
  id: string;
  rideId: string;
  offeredAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  ride: {
    id: string;
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
    } | null;
  };
}

/**
 * Query key factory for ride offer queries
 */
export const offerKeys = {
  all: ['ride-offers'] as const,
  pending: (driverId: string) => [...offerKeys.all, 'pending', driverId] as const,
};

// Type for the Supabase offer response
interface OfferResponse {
  id: string;
  ride_id: string;
  offered_at: string;
  expires_at: string;
  status: string;
  ride: {
    id: string;
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
    } | null;
  } | null;
}

/**
 * Hook to fetch pending ride offer with real-time updates and countdown
 *
 * @returns Query result with pending offer, time remaining, and loading state
 */
export function useRideOffer() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Set up real-time subscription for new offers
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`driver:${userId}:offers`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_offers',
        },
        () => {
          // Invalidate to fetch new offer
          queryClient.invalidateQueries({ queryKey: offerKeys.all });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_offers',
        },
        () => {
          // Invalidate on status changes
          queryClient.invalidateQueries({ queryKey: offerKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, queryClient]);

  const query = useQuery({
    queryKey: offerKeys.pending(userId ?? ''),
    queryFn: async (): Promise<RideOffer | null> => {
      if (!userId) return null;

      // Get driver's internal user ID from clerk_id
      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) {
        return null;
      }

      // Get pending offer with ride details
      const { data, error } = await supabase
        .from('ride_offers')
        .select(
          `
          id,
          ride_id,
          offered_at,
          expires_at,
          status,
          ride:rides!ride_id (
            id,
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
              special_equipment_notes
            )
          )
        `
        )
        .eq('driver_id', driverUser.id)
        .eq('status', 'pending')
        .order('offered_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // PGRST116 = no rows found, which is fine
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) return null;

      const offer = data as unknown as OfferResponse;

      return {
        id: offer.id,
        rideId: offer.ride_id,
        offeredAt: offer.offered_at,
        expiresAt: offer.expires_at,
        status: offer.status as RideOffer['status'],
        ride: {
          id: offer.ride?.id ?? '',
          pickupAddress: offer.ride?.pickup_address ?? '',
          dropoffAddress: offer.ride?.dropoff_address ?? '',
          scheduledPickupTime: offer.ride?.scheduled_pickup_time ?? '',
          rider: {
            id: offer.ride?.rider?.id ?? '',
            firstName: offer.ride?.rider?.first_name ?? '',
            lastName: offer.ride?.rider?.last_name ?? '',
            phone: offer.ride?.rider?.phone ?? '',
            profilePhotoUrl: offer.ride?.rider?.profile_photo_url ?? null,
          },
          riderPreferences: offer.ride?.rider_preferences
            ? {
                mobilityAid: offer.ride.rider_preferences.mobility_aid,
                needsDoorAssistance: offer.ride.rider_preferences.needs_door_assistance ?? false,
                needsPackageAssistance:
                  offer.ride.rider_preferences.needs_package_assistance ?? false,
                extraVehicleSpace: offer.ride.rider_preferences.extra_vehicle_space ?? false,
                specialEquipmentNotes: offer.ride.rider_preferences.special_equipment_notes,
              }
            : null,
        },
      };
    },
    enabled: !!userId,
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Update countdown timer
  useEffect(() => {
    if (!query.data?.expiresAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(query.data!.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Offer expired - invalidate to refetch
        queryClient.invalidateQueries({ queryKey: offerKeys.all });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [query.data?.expiresAt, queryClient]);

  return {
    ...query,
    timeRemaining,
  };
}
