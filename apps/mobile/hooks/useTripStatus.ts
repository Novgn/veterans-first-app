/**
 * Hook for transitioning trip status (Story 3.4 - FR22, FR47, FR48)
 *
 * Handles the driver's trip status progression:
 *   assigned → en_route → arrived → in_progress → completed
 *
 * Each valid transition:
 *   - Updates `rides.status`
 *   - Inserts a corresponding row in `ride_events` with GPS location
 *   - Invalidates trip queries so UI reflects new state
 *
 * Invalid transitions are rejected client-side before any DB write.
 */

import { useAuth, useSession } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { notifyRideEvent, type RideNotificationType } from '@/lib/notifications';
import { useSupabase } from '@/lib/supabase';

import { tripKeys } from './useDriverTrips';

export type RideStatus = 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed';

export type RideEventType =
  | 'en_route'
  | 'arrived'
  | 'trip_started'
  | 'trip_completed'
  | 'no_show'
  | 'cancelled';

export interface TripStatusInput {
  rideId: string;
  newStatus: RideStatus;
  location?: { lat: number; lng: number } | null;
  notes?: string;
  /** Optional arrival/no-show photo URL (Story 3.9) */
  photoUrl?: string | null;
}

/**
 * Maps each target status to the event row that should be recorded.
 * 'assigned' is the entry point and never records an event.
 */
export const STATUS_TO_EVENT: Record<RideStatus, RideEventType | null> = {
  assigned: null,
  en_route: 'en_route',
  arrived: 'arrived',
  in_progress: 'trip_started',
  completed: 'trip_completed',
};

/**
 * Valid forward transitions. Used by the hook (and UI) to guard against
 * out-of-order status changes.
 */
export const VALID_TRANSITIONS: Record<RideStatus, RideStatus | null> = {
  assigned: 'en_route',
  en_route: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

export function isValidTransition(current: RideStatus, next: RideStatus): boolean {
  return VALID_TRANSITIONS[current] === next;
}

const STATUS_TO_NOTIFICATION: Partial<Record<RideStatus, RideNotificationType>> = {
  en_route: 'driver_en_route',
  arrived: 'driver_arrived',
  in_progress: 'ride_in_progress',
  completed: 'ride_completed',
};

export function useTripStatus() {
  const { userId } = useAuth();
  const { session } = useSession();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rideId, newStatus, location, notes, photoUrl }: TripStatusInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Resolve driver's internal user id (needed for FK on ride_events)
      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) {
        throw new Error('Driver not found');
      }

      // Update ride status
      const { error: rideError } = await supabase
        .from('rides')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rideId);

      if (rideError) throw rideError;

      // Record status event if mapped
      const eventType = STATUS_TO_EVENT[newStatus];
      if (eventType) {
        const { error: eventError } = await supabase.from('ride_events').insert({
          ride_id: rideId,
          event_type: eventType,
          driver_id: driverUser.id,
          lat: location?.lat ?? null,
          lng: location?.lng ?? null,
          notes: notes ?? null,
          photo_url: photoUrl ?? null,
        });

        if (eventError) throw eventError;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      const notifyType = STATUS_TO_NOTIFICATION[variables.newStatus];
      if (notifyType) {
        // Fire-and-forget — don't block the primary mutation on network.
        void notifyRideEvent(session, {
          type: notifyType,
          rideId: variables.rideId,
          hasArrivalPhoto:
            notifyType === 'ride_completed' ? Boolean(variables.photoUrl) : undefined,
        });
      }
    },
  });
}
