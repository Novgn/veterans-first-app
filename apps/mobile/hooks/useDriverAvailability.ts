/**
 * useDriverAvailability — CRUD for weekly availability windows (Story 3.7)
 *
 * Fetches the signed-in driver's windows ordered by day/start time, plus
 * provides mutations for add/update/delete. Uses TanStack Query with a
 * simple query-key factory to invalidate on write.
 */

import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AvailabilityWindow {
  id: string;
  driverId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM:SS"
  endTime: string;
  isActive: boolean;
}

export interface NewAvailabilityWindow {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

interface AvailabilityRow {
  id: string;
  driver_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export const availabilityKeys = {
  all: ['driver-availability'] as const,
  list: (driverId: string) => [...availabilityKeys.all, 'list', driverId] as const,
};

function mapRow(row: AvailabilityRow): AvailabilityWindow {
  return {
    id: row.id,
    driverId: row.driver_id,
    dayOfWeek: row.day_of_week as DayOfWeek,
    startTime: row.start_time,
    endTime: row.end_time,
    isActive: row.is_active,
  };
}

export function useDriverAvailability() {
  const { userId } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: availabilityKeys.list(userId ?? ''),
    queryFn: async (): Promise<AvailabilityWindow[]> => {
      if (!userId) return [];

      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) return [];

      const { data, error } = await supabase
        .from('driver_availability')
        .select('*')
        .eq('driver_id', driverUser.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return ((data as AvailabilityRow[] | null) ?? []).map(mapRow);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAvailability() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewAvailabilityWindow) => {
      if (!userId) throw new Error('Not authenticated');

      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) throw new Error('Driver not found');

      const { error } = await supabase.from('driver_availability').insert({
        driver_id: driverUser.id,
        day_of_week: input.dayOfWeek,
        start_time: input.startTime,
        end_time: input.endTime,
        is_active: input.isActive ?? true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

export function useUpdateAvailability() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewAvailabilityWindow> & { id: string }) => {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.dayOfWeek !== undefined) patch.day_of_week = updates.dayOfWeek;
      if (updates.startTime !== undefined) patch.start_time = updates.startTime;
      if (updates.endTime !== undefined) patch.end_time = updates.endTime;
      if (updates.isActive !== undefined) patch.is_active = updates.isActive;

      const { error } = await supabase.from('driver_availability').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

export function useDeleteAvailability() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('driver_availability').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}
