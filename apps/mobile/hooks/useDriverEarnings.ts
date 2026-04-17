/**
 * useDriverEarnings — aggregate completed-ride fares over time periods
 * (Story 3.8).
 *
 * Returns buckets for: today, this week (Mon-start), this month (calendar),
 * and an all-time total. Also surfaces the most-recent completed trips for
 * a mini activity feed on the dashboard.
 *
 * Money is stored in integer cents; returned to callers as cents so the UI
 * can format locale-aware.
 */

import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

export interface EarningsBuckets {
  todayCents: number;
  weekCents: number;
  monthCents: number;
  allTimeCents: number;
  tripCountToday: number;
  tripCountWeek: number;
  tripCountMonth: number;
  recent: Array<{
    id: string;
    completedAt: string;
    fareCents: number;
    pickupAddress: string;
    dropoffAddress: string;
  }>;
}

interface CompletedRideRow {
  id: string;
  fare_cents: number | null;
  completed_at: string | null;
  pickup_address: string;
  dropoff_address: string;
}

export const earningsKeys = {
  all: ['driver-earnings'] as const,
  driver: (driverId: string) => [...earningsKeys.all, 'driver', driverId] as const,
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeekMon(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function aggregateEarnings(
  rows: CompletedRideRow[],
  now: Date = new Date()
): EarningsBuckets {
  const today = startOfDay(now).getTime();
  const week = startOfWeekMon(now).getTime();
  const month = startOfMonth(now).getTime();

  let todayCents = 0;
  let weekCents = 0;
  let monthCents = 0;
  let allTimeCents = 0;
  let tripCountToday = 0;
  let tripCountWeek = 0;
  let tripCountMonth = 0;

  for (const row of rows) {
    const fare = row.fare_cents ?? 0;
    allTimeCents += fare;
    if (!row.completed_at) continue;
    const ts = new Date(row.completed_at).getTime();
    if (Number.isNaN(ts)) continue;
    if (ts >= month) {
      monthCents += fare;
      tripCountMonth += 1;
    }
    if (ts >= week) {
      weekCents += fare;
      tripCountWeek += 1;
    }
    if (ts >= today) {
      todayCents += fare;
      tripCountToday += 1;
    }
  }

  const recent = rows
    .filter((row) => row.completed_at)
    .sort((a, b) => {
      const ta = new Date(a.completed_at ?? 0).getTime();
      const tb = new Date(b.completed_at ?? 0).getTime();
      return tb - ta;
    })
    .slice(0, 10)
    .map((row) => ({
      id: row.id,
      completedAt: row.completed_at ?? '',
      fareCents: row.fare_cents ?? 0,
      pickupAddress: row.pickup_address,
      dropoffAddress: row.dropoff_address,
    }));

  return {
    todayCents,
    weekCents,
    monthCents,
    allTimeCents,
    tripCountToday,
    tripCountWeek,
    tripCountMonth,
    recent,
  };
}

export function useDriverEarnings() {
  const { userId } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: earningsKeys.driver(userId ?? ''),
    queryFn: async (): Promise<EarningsBuckets> => {
      if (!userId) return aggregateEarnings([]);

      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) return aggregateEarnings([]);

      const { data, error } = await supabase
        .from('rides')
        .select('id, fare_cents, completed_at, pickup_address, dropoff_address')
        .eq('driver_id', driverUser.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return aggregateEarnings((data as CompletedRideRow[] | null) ?? []);
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

/** Format integer cents as a USD money string. Exported for UI/tests. */
export function formatMoneyCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
