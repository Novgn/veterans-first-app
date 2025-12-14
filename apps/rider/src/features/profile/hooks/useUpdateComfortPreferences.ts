/**
 * TanStack Query hook for updating rider comfort preferences.
 *
 * Story 2.14: Comfort Preferences (FR73)
 * Updates comfort preferences in rider_preferences table.
 * Implements optimistic updates for smooth UX.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';

import { comfortKeys, type ComfortPreferences } from './useComfortPreferences';

/**
 * Updates the current user's comfort preferences.
 *
 * Implements optimistic updates for immediate UI feedback.
 * Changes are automatically audit-logged via database trigger.
 *
 * @returns Mutation result with update function
 */
export function useUpdateComfortPreferences() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ComfortPreferences): Promise<void> => {
      if (!user?.id) throw new Error('Not authenticated');

      // Get the user's internal ID from clerk_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError) throw userError;

      // Upsert the rider_preferences record
      const { error } = await supabase.from('rider_preferences').upsert(
        {
          user_id: userData.id,
          comfort_temperature: input.comfortTemperature,
          conversation_preference: input.conversationPreference,
          music_preference: input.musicPreference,
          other_notes: input.otherNotes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) throw error;
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: comfortKeys.detail(user?.id ?? '') });

      // Snapshot previous value
      const previousPrefs = queryClient.getQueryData<ComfortPreferences>(
        comfortKeys.detail(user?.id ?? '')
      );

      // Optimistically update preferences
      queryClient.setQueryData(comfortKeys.detail(user?.id ?? ''), newData);

      return { previousPrefs };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousPrefs) {
        queryClient.setQueryData(comfortKeys.detail(user?.id ?? ''), context.previousPrefs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: comfortKeys.detail(user?.id ?? '') });
    },
  });
}
