/**
 * useBookRide Mutation Hook
 *
 * TanStack Query mutation for creating ride bookings.
 * Handles optimistic updates and cache invalidation.
 *
 * Features:
 * - Creates ride record in database
 * - Sets status to 'pending' (awaiting driver assignment)
 * - Updates booking store with result
 * - Invalidates rides query cache
 * - Full error handling
 *
 * Story 2.5: 3-Tap Booking Flow - Confirmation (Tap 3)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';
import { useBookingStore, Destination, RecurringFrequency } from '@/stores/bookingStore';

/**
 * Booking request parameters
 */
export interface BookingRequest {
  /** Pickup location (null = use rider's default home) */
  pickupDestination: Destination | null;
  /** Destination location (required) */
  dropoffDestination: Destination;
  /** Scheduled date in ISO format (YYYY-MM-DD) */
  scheduledDate: string;
  /** Scheduled time (e.g., "10:30 AM") or null for ASAP */
  scheduledTime: string | null;
  /** Price in cents (e.g., 4500 = $45) */
  priceCents: number;
  /** Whether this is a recurring ride */
  isRecurring?: boolean;
  /** Recurring frequency - uses store's RecurringFrequency type */
  recurringFrequency?: RecurringFrequency;
  /** Days for recurring rides */
  recurringDays?: string[];
  /** Preferred driver ID (soft preference) - Story 2.7 */
  preferredDriverId?: string | null;
}

/**
 * Booking response from the mutation
 */
export interface BookingResponse {
  /** Ride UUID */
  id: string;
  /** Ride status */
  status: string;
  /** Human-readable confirmation number */
  confirmationNumber: string;
}

/**
 * Converts 12-hour time format to 24-hour format.
 * @param time12 - Time in 12-hour format (e.g., "10:30 AM")
 * @returns Time in 24-hour format (e.g., "10:30")
 */
function convertTo24Hour(time12: string): string {
  const parts = time12.split(' ');
  const time = parts[0] ?? '00:00';
  const period = parts[1] ?? 'AM';
  const timeParts = time.split(':');
  const hoursStr = timeParts[0] ?? '0';
  const minutesStr = timeParts[1] ?? '0';
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Hook for booking a ride.
 *
 * Uses TanStack Query mutation for optimistic updates and cache management.
 *
 * @example
 * ```typescript
 * const bookRide = useBookRide();
 *
 * await bookRide.mutateAsync({
 *   pickupDestination: null, // Home
 *   dropoffDestination: { id: '1', name: 'VA Hospital', address: '123 Main St' },
 *   scheduledDate: '2024-01-15',
 *   scheduledTime: '10:30 AM',
 *   priceCents: 4500,
 * });
 * ```
 */
export function useBookRide() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const setLastBookingResult = useBookingStore((state) => state.setLastBookingResult);

  return useMutation({
    mutationFn: async (request: BookingRequest): Promise<BookingResponse> => {
      // Construct scheduled timestamp
      let scheduledTimestamp: string;

      if (request.scheduledTime) {
        const time24 = convertTo24Hour(request.scheduledTime);
        scheduledTimestamp = `${request.scheduledDate}T${time24}:00`;
      } else {
        // ASAP - use current time
        scheduledTimestamp = new Date().toISOString();
      }

      // Build pickup address
      const pickupAddress = request.pickupDestination?.address || 'Home';

      // For MVP: Direct Supabase insert
      // Future: Call book-ride Edge Function for complex pricing logic
      const { data, error } = await supabase
        .from('rides')
        .insert({
          // rider_id is automatically set by RLS trigger using auth.uid()
          pickup_address: pickupAddress,
          dropoff_address: request.dropoffDestination.address,
          scheduled_pickup_time: scheduledTimestamp,
          status: 'pending',
          // Preferred driver (soft preference) - Story 2.7
          preferred_driver_id: request.preferredDriverId ?? null,
          // Future fields for when pricing Edge Function is ready:
          // price_cents: request.priceCents,
          // pickup_lat: request.pickupDestination?.latitude,
          // pickup_lng: request.pickupDestination?.longitude,
          // dropoff_lat: request.dropoffDestination.latitude,
          // dropoff_lng: request.dropoffDestination.longitude,
        })
        .select('id, status')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Generate confirmation number from ID
      const confirmationNumber = data.id.slice(0, 8).toUpperCase();

      return {
        id: data.id,
        status: data.status,
        confirmationNumber,
      };
    },

    onSuccess: (data) => {
      // Update booking store with result
      setLastBookingResult(data.id, data.confirmationNumber);

      // Invalidate rides cache to refresh upcoming rides list
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },

    onError: (error) => {
      console.error('Booking failed:', error);
    },
  });
}
