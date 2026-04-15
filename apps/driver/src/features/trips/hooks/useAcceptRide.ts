/**
 * Hook for accepting a ride offer
 *
 * Features:
 * - Updates offer status to 'accepted'
 * - Updates ride status to 'assigned'
 * - Invalidates relevant queries on success
 * - Handles errors gracefully
 */

import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';

import { tripKeys } from './useDriverTrips';
import { offerKeys } from './useRideOffer';

/**
 * Input for accepting a ride offer
 */
export interface AcceptRideInput {
  offerId: string;
  rideId: string;
}

/**
 * Hook to accept a ride offer
 *
 * Updates the offer status to 'accepted' and ride status to 'assigned',
 * then invalidates relevant queries to refresh the trip queue.
 *
 * @returns Mutation for accepting a ride offer
 */
export function useAcceptRide() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, rideId }: AcceptRideInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Update offer status to accepted
      const { error: offerError } = await supabase
        .from('ride_offers')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (offerError) throw offerError;

      // Update ride status to assigned
      const { error: rideError } = await supabase
        .from('rides')
        .update({
          status: 'assigned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', rideId);

      if (rideError) throw rideError;

      // TODO: Trigger push notification to rider via Edge Function
      // This could be done via a database trigger or Edge Function call
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: offerKeys.all });
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}
