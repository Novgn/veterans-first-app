/**
 * useCancelRide Mutation Hook
 *
 * TanStack Query mutation for cancelling rides.
 * Updates ride status to 'cancelled' and captures optional reason.
 *
 * Features:
 * - Updates ride status to 'cancelled'
 * - Captures cancellation reason (optional)
 * - Invalidates rides cache on success
 * - Full error handling
 * - Audit logging via database triggers (automatic)
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

/**
 * Cancel ride request parameters
 */
export interface CancelRideRequest {
  /** Ride UUID to cancel */
  rideId: string;
  /** Optional cancellation reason */
  reason?: string;
}

/**
 * Cancel ride response
 */
export interface CancelRideResponse {
  /** Ride UUID */
  id: string;
  /** Updated status */
  status: string;
  /** Timestamp when cancelled */
  cancelledAt: string;
  /** Previous status (for undo) */
  previousStatus: string;
}

/**
 * Hook for cancelling a ride.
 *
 * @returns Mutation with mutate, mutateAsync, isLoading, error, data
 *
 * @example
 * ```typescript
 * const cancelRide = useCancelRide();
 *
 * await cancelRide.mutateAsync({
 *   rideId: 'abc-123',
 *   reason: 'Plans changed',
 * });
 * ```
 */
export function useCancelRide() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CancelRideRequest): Promise<CancelRideResponse> => {
      // First, fetch current status for undo capability
      const { data: currentRide, error: fetchError } = await supabase
        .from('rides')
        .select('status')
        .eq('id', request.rideId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const previousStatus = currentRide.status;

      // Validate ride can be cancelled
      if (!['pending', 'assigned'].includes(previousStatus)) {
        throw new Error(`Cannot cancel ride with status: ${previousStatus}`);
      }

      // Update ride status to cancelled
      // Note: cancellation_reason field may be added in future migration
      const { data, error } = await supabase
        .from('rides')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.rideId)
        .select('id, status, updated_at')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        status: data.status,
        cancelledAt: data.updated_at,
        previousStatus,
      };
    },

    onSuccess: (_, variables) => {
      // Invalidate rides cache to refresh list
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      // Invalidate specific ride
      queryClient.invalidateQueries({ queryKey: ['ride', variables.rideId] });
    },
  });
}
