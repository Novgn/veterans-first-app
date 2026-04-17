/**
 * useModifyRide Mutation Hook
 *
 * TanStack Query mutation for modifying ride details.
 * Updates scheduled time and/or destination.
 *
 * Features:
 * - Updates scheduled_pickup_time and/or dropoff_address
 * - Validates ride is in modifiable state (pending/assigned)
 * - Invalidates rides cache on success
 * - Full error handling
 * - Audit logging via database triggers (automatic)
 *
 * Story 2.6: Ride Modification and Cancellation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

/**
 * Modify ride request parameters
 */
export interface ModifyRideRequest {
  /** Ride UUID to modify */
  rideId: string;
  /** New scheduled pickup time (ISO string) */
  scheduledPickupTime?: string;
  /** New dropoff address */
  dropoffAddress?: string;
}

/**
 * Modify ride response
 */
export interface ModifyRideResponse {
  /** Ride UUID */
  id: string;
  /** Current status */
  status: string;
  /** Updated scheduled pickup time */
  scheduledPickupTime: string | null;
  /** Updated dropoff address */
  dropoffAddress: string;
}

/**
 * Hook for modifying a ride's time or destination.
 *
 * @returns Mutation with mutate, mutateAsync, isLoading, error, data
 *
 * @example
 * ```typescript
 * const modifyRide = useModifyRide();
 *
 * await modifyRide.mutateAsync({
 *   rideId: 'abc-123',
 *   scheduledPickupTime: '2024-01-15T14:00:00',
 *   dropoffAddress: '456 New St, City',
 * });
 * ```
 */
export function useModifyRide() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ModifyRideRequest): Promise<ModifyRideResponse> => {
      // Build update object with only provided fields
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (request.scheduledPickupTime) {
        updates.scheduled_pickup_time = request.scheduledPickupTime;
      }
      if (request.dropoffAddress) {
        updates.dropoff_address = request.dropoffAddress;
      }

      // Update ride with status filter (only pending/assigned can be modified)
      const { data, error } = await supabase
        .from('rides')
        .update(updates)
        .eq('id', request.rideId)
        .in('status', ['pending', 'assigned'])
        .select('id, status, scheduled_pickup_time, dropoff_address')
        .single();

      if (error) {
        // Handle case where ride is not in modifiable status
        if (error.code === 'PGRST116') {
          throw new Error(
            'This ride cannot be modified. It may have already started or been cancelled.'
          );
        }
        throw new Error(error.message);
      }

      return {
        id: data.id,
        status: data.status,
        scheduledPickupTime: data.scheduled_pickup_time,
        dropoffAddress: data.dropoff_address,
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
