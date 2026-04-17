/**
 * Family-side booking hook (Story 4.4).
 *
 * A family member with an approved link + `book_rides` permission can
 * book a ride on behalf of their linked rider. RLS (migration 0026)
 * enforces both the permission check and the self-stamping of
 * `booked_by_id`, so server-side is safe even if the UI gate is bypassed.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

import { familyRideKeys } from './useFamilyRiderRides';

export interface FamilyBookRideInput {
  riderId: string;
  pickupAddress: string;
  dropoffAddress: string;
  /** ISO 8601 string for the scheduled pickup time. */
  scheduledPickupTime: string;
}

export interface FamilyBookRideResult {
  id: string;
  rider_id: string;
  booked_by_id: string;
  status: string;
  scheduled_pickup_time: string;
}

function validate(input: FamilyBookRideInput): void {
  if (!input.riderId) throw new Error('Rider is required');
  if (!input.pickupAddress.trim()) throw new Error('Pickup address is required');
  if (!input.dropoffAddress.trim()) throw new Error('Drop-off address is required');
  if (!input.scheduledPickupTime) throw new Error('Pickup time is required');
  const when = new Date(input.scheduledPickupTime);
  if (Number.isNaN(when.getTime())) throw new Error('Pickup time is invalid');
  if (when.getTime() < Date.now() - 60_000) throw new Error('Pickup time must be in the future');
}

export function useFamilyBookRide() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: FamilyBookRideInput): Promise<FamilyBookRideResult> => {
      if (!user?.id) throw new Error('Not signed in');
      validate(input);

      const { data: me, error: meError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      if (meError || !me) throw new Error('User profile not found');

      const { data, error } = await supabase
        .from('rides')
        .insert({
          rider_id: input.riderId,
          booked_by_id: me.id,
          status: 'pending',
          pickup_address: input.pickupAddress.trim(),
          dropoff_address: input.dropoffAddress.trim(),
          scheduled_pickup_time: new Date(input.scheduledPickupTime).toISOString(),
        })
        .select('id, rider_id, booked_by_id, status, scheduled_pickup_time')
        .single();
      if (error) throw error;
      return data as FamilyBookRideResult;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: familyRideKeys.byRider(variables.riderId) });
      queryClient.invalidateQueries({ queryKey: familyRideKeys.all });
    },
  });
}
