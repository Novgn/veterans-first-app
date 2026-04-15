/**
 * Hook for declining a ride offer
 *
 * Features:
 * - Updates offer status to 'declined' with optional reason
 * - Returns ride to dispatch pool (status back to 'confirmed', clears driver_id)
 * - Invalidates relevant queries on success
 * - Handles errors gracefully
 */

import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';

import { offerKeys } from './useRideOffer';

/**
 * Input for declining a ride offer
 */
export interface DeclineRideInput {
  offerId: string;
  rideId: string;
  reason?: string;
}

/**
 * Hook to decline a ride offer
 *
 * Updates the offer status to 'declined' with optional reason,
 * returns the ride to the dispatch pool by setting status to 'confirmed'
 * and clearing the driver_id.
 *
 * @returns Mutation for declining a ride offer
 */
export function useDeclineRide() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, rideId, reason }: DeclineRideInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Update offer status to declined with optional reason
      const { error: offerError } = await supabase
        .from('ride_offers')
        .update({
          status: 'declined',
          decline_reason: reason ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (offerError) throw offerError;

      // Return ride to dispatch pool (status back to confirmed, clear driver_id)
      const { error: rideError } = await supabase
        .from('rides')
        .update({
          status: 'confirmed',
          driver_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rideId);

      if (rideError) throw rideError;
    },
    onSuccess: () => {
      // Invalidate offer queries to refresh data
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
    },
  });
}
