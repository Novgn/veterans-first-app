/**
 * TanStack Query hooks for saved destinations management.
 *
 * Implements the query key factory pattern from architecture docs
 * with optimistic updates for smooth UX.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';

// Types matching the database schema (snake_case for Supabase compatibility)
export interface SavedDestination {
  id: string;
  user_id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string | null;
  is_default_pickup: boolean;
  is_default_dropoff: boolean;
  created_at: string;
  updated_at: string;
}

// Re-export type for external usage with consistent naming
export type { SavedDestination as SavedDestinationType };

export interface NewSavedDestination {
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id?: string | null;
  is_default_pickup?: boolean;
  is_default_dropoff?: boolean;
}

export interface UpdateSavedDestination {
  id: string;
  label?: string;
  address?: string;
  lat?: number;
  lng?: number;
  place_id?: string | null;
  is_default_pickup?: boolean;
  is_default_dropoff?: boolean;
}

// Query key factory pattern (from architecture)
export const destinationKeys = {
  all: ['destinations'] as const,
  lists: () => [...destinationKeys.all, 'list'] as const,
  list: (userId: string) => [...destinationKeys.lists(), userId] as const,
  detail: (id: string) => [...destinationKeys.all, 'detail', id] as const,
};

/**
 * Fetches all saved destinations for the current user.
 *
 * Uses explicit user_id filtering for defense-in-depth (in addition to RLS).
 *
 * @returns Query result with array of saved destinations
 */
export function useDestinations() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: destinationKeys.list(user?.id ?? ''),
    queryFn: async (): Promise<SavedDestination[]> => {
      if (!user?.id) return [];

      // First get the user's internal UUID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError || !userData) {
        // User not synced to database yet - return empty array
        console.warn('User not found in database, destinations unavailable');
        return [];
      }

      // Explicitly filter by user_id for defense-in-depth (RLS also enforces this)
      const { data, error } = await supabase
        .from('saved_destinations')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as SavedDestination[]) ?? [];
    },
    enabled: !!user?.id,
  });
}

/**
 * Creates a new saved destination.
 *
 * Implements optimistic updates for immediate UI feedback.
 */
export function useCreateDestination() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (destination: NewSavedDestination): Promise<SavedDestination> => {
      // First, get the user's internal UUID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user?.id)
        .single();

      if (userError) throw new Error('User not found');

      const { data, error } = await supabase
        .from('saved_destinations')
        .insert({
          ...destination,
          user_id: userData.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SavedDestination;
    },
    onMutate: async (newDestination) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: destinationKeys.lists() });

      // Snapshot previous value
      const previousDestinations = queryClient.getQueryData(destinationKeys.list(user?.id ?? ''));

      // Optimistically add new destination
      queryClient.setQueryData<SavedDestination[]>(destinationKeys.list(user?.id ?? ''), (old) => [
        {
          id: `temp-${Date.now()}`,
          user_id: user?.id ?? '',
          ...newDestination,
          place_id: newDestination.place_id ?? null,
          is_default_pickup: newDestination.is_default_pickup ?? false,
          is_default_dropoff: newDestination.is_default_dropoff ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...(old ?? []),
      ]);

      return { previousDestinations };
    },
    onError: (_err, _newDestination, context) => {
      // Rollback on error
      queryClient.setQueryData(destinationKeys.list(user?.id ?? ''), context?.previousDestinations);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() });
    },
  });
}

/**
 * Updates an existing saved destination.
 *
 * Implements optimistic updates for immediate UI feedback.
 */
export function useUpdateDestination() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSavedDestination): Promise<SavedDestination> => {
      const { data, error } = await supabase
        .from('saved_destinations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SavedDestination;
    },
    onMutate: async (updatedDestination) => {
      await queryClient.cancelQueries({ queryKey: destinationKeys.lists() });

      const previousDestinations = queryClient.getQueryData(destinationKeys.list(user?.id ?? ''));

      // Optimistically update
      queryClient.setQueryData<SavedDestination[]>(destinationKeys.list(user?.id ?? ''), (old) =>
        old?.map((dest) =>
          dest.id === updatedDestination.id
            ? {
                ...dest,
                ...updatedDestination,
                updated_at: new Date().toISOString(),
              }
            : dest
        )
      );

      return { previousDestinations };
    },
    onError: (_err, _updatedDestination, context) => {
      queryClient.setQueryData(destinationKeys.list(user?.id ?? ''), context?.previousDestinations);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() });
    },
  });
}

/**
 * Deletes a saved destination.
 *
 * Implements optimistic updates for immediate UI feedback.
 */
export function useDeleteDestination() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('saved_destinations').delete().eq('id', id);

      if (error) throw error;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: destinationKeys.lists() });

      const previousDestinations = queryClient.getQueryData(destinationKeys.list(user?.id ?? ''));

      // Optimistically remove
      queryClient.setQueryData<SavedDestination[]>(destinationKeys.list(user?.id ?? ''), (old) =>
        old?.filter((dest) => dest.id !== deletedId)
      );

      return { previousDestinations };
    },
    onError: (_err, _deletedId, context) => {
      queryClient.setQueryData(destinationKeys.list(user?.id ?? ''), context?.previousDestinations);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: destinationKeys.lists() });
    },
  });
}
