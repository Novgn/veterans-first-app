/**
 * Family-role read-only hooks for a linked rider's rides (Story 4.3).
 *
 * RLS (migration 0025) enforces that only approved family members can
 * SELECT these rows. The hooks below are thin fetches — all write paths
 * stay in the rider app, honoring the acceptance criterion that family
 * members cannot modify rides.
 */

import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

export interface FamilyRideRow {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string;
  completed_at: string | null;
  fare_cents: number | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyRideDriver {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
}

export interface FamilyRideDetail extends FamilyRideRow {
  driver: FamilyRideDriver | null;
  rider: FamilyRideDriver | null;
  events: FamilyRideEvent[];
}

export interface FamilyRideEvent {
  id: string;
  ride_id: string;
  event_type: string;
  created_at: string;
  notes: string | null;
  photo_url: string | null;
}

export const familyRideKeys = {
  all: ['family-rides'] as const,
  byRider: (riderId: string) => [...familyRideKeys.all, 'rider', riderId] as const,
  detail: (rideId: string) => [...familyRideKeys.all, 'detail', rideId] as const,
};

const COMPLETED_STATUSES = new Set(['completed', 'cancelled', 'no_show']);

export interface FamilyRideBuckets {
  upcoming: FamilyRideRow[];
  history: FamilyRideRow[];
}

export function useFamilyRiderRides(riderId: string | undefined) {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: familyRideKeys.byRider(riderId ?? ''),
    enabled: !!riderId && !!user?.id,
    queryFn: async (): Promise<FamilyRideBuckets> => {
      if (!riderId) return { upcoming: [], history: [] };

      const { data, error } = await supabase
        .from('rides')
        .select(
          'id, rider_id, driver_id, status, pickup_address, dropoff_address, scheduled_pickup_time, completed_at, fare_cents, created_at, updated_at'
        )
        .eq('rider_id', riderId)
        .order('scheduled_pickup_time', { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as FamilyRideRow[];
      const upcoming = rows
        .filter((r) => !COMPLETED_STATUSES.has(r.status))
        .sort(
          (a, b) =>
            new Date(a.scheduled_pickup_time).getTime() -
            new Date(b.scheduled_pickup_time).getTime()
        );
      const history = rows.filter((r) => COMPLETED_STATUSES.has(r.status));
      return { upcoming, history };
    },
  });
}

export function useFamilyRideDetail(rideId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: familyRideKeys.detail(rideId ?? ''),
    enabled: !!rideId,
    queryFn: async (): Promise<FamilyRideDetail | null> => {
      if (!rideId) return null;

      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select(
          `
          id, rider_id, driver_id, status, pickup_address, dropoff_address,
          scheduled_pickup_time, completed_at, fare_cents, created_at, updated_at,
          driver:users!driver_id(id, first_name, last_name, profile_photo_url),
          rider:users!rider_id(id, first_name, last_name, profile_photo_url)
        `
        )
        .eq('id', rideId)
        .maybeSingle();
      if (rideError) throw rideError;
      if (!ride) return null;

      const { data: events, error: eventsError } = await supabase
        .from('ride_events')
        .select('id, ride_id, event_type, created_at, notes, photo_url')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });
      if (eventsError) throw eventsError;

      return {
        ...(ride as unknown as FamilyRideRow),
        driver: (ride as unknown as { driver: FamilyRideDriver | null }).driver,
        rider: (ride as unknown as { rider: FamilyRideDriver | null }).rider,
        events: (events ?? []) as FamilyRideEvent[],
      };
    },
  });
}
