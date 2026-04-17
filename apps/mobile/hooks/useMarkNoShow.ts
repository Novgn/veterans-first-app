/**
 * useMarkNoShow — mark a trip as no-show (Story 3.10)
 *
 * Gate-keeps the action:
 *   - Current status must be 'arrived' (driver waited at the pickup).
 *   - The no_show event carries optional notes + optional photo as evidence.
 *
 * Writes both: flip `rides.status = 'no_show'` and insert a `no_show` row
 * in `ride_events` for audit/dispatch reporting (Story 3.18 reads this).
 */

import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

import { tripKeys } from './useDriverTrips';

export interface NoShowInput {
  rideId: string;
  notes?: string;
  photoUrl?: string | null;
  location?: { lat: number; lng: number } | null;
}

export function useMarkNoShow() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rideId, notes, photoUrl, location }: NoShowInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) throw new Error('Driver not found');

      // Update ride status → no_show
      const { error: rideError } = await supabase
        .from('rides')
        .update({ status: 'no_show', updated_at: new Date().toISOString() })
        .eq('id', rideId);

      if (rideError) throw rideError;

      const { error: eventError } = await supabase.from('ride_events').insert({
        ride_id: rideId,
        event_type: 'no_show',
        driver_id: driverUser.id,
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
        notes: notes ?? null,
        photo_url: photoUrl ?? null,
      });

      if (eventError) throw eventError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
