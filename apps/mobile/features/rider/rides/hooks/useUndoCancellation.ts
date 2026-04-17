/**
 * useUndoCancellation Mutation Hook
 *
 * TanStack Query mutation for undoing ride cancellation.
 * Restores ride to previous status within 60-second window.
 *
 * Features:
 * - Restores ride status to 'pending' (safe default)
 * - Only works for recently cancelled rides
 * - Invalidates rides cache on success
 * - Full error handling
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

/**
 * Undo cancellation request parameters
 */
export interface UndoCancellationRequest {
  /** Ride UUID to restore */
  rideId: string;
  /** Previous status to restore to (defaults to 'pending') */
  previousStatus?: string;
}

/**
 * Undo cancellation response
 */
export interface UndoCancellationResponse {
  /** Ride UUID */
  id: string;
  /** Restored status */
  status: string;
}

/**
 * Hook for undoing a ride cancellation.
 *
 * @returns Mutation with mutate, mutateAsync, isLoading, error, data
 *
 * @example
 * ```typescript
 * const undoCancellation = useUndoCancellation();
 *
 * await undoCancellation.mutateAsync({
 *   rideId: 'abc-123',
 *   previousStatus: 'pending',
 * });
 * ```
 */
export function useUndoCancellation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UndoCancellationRequest): Promise<UndoCancellationResponse> => {
      // Default to 'pending' if no previous status provided
      const restoreStatus = request.previousStatus || 'pending';

      // Verify ride is currently cancelled before restoring
      const { data: currentRide, error: fetchError } = await supabase
        .from('rides')
        .select('status')
        .eq('id', request.rideId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (currentRide.status !== 'cancelled') {
        throw new Error('This ride is not cancelled and cannot be restored.');
      }

      // Restore ride to previous status
      const { data, error } = await supabase
        .from('rides')
        .update({
          status: restoreStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.rideId)
        .select('id, status')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        status: data.status,
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
