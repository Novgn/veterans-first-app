/**
 * TanStack Query hook for updating rider accessibility preferences.
 *
 * Story 2.13: Accessibility Preferences (FR72)
 * Updates accessibility preferences in rider_preferences table.
 * Implements optimistic updates for smooth UX.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

import { accessibilityKeys, type AccessibilityPreferences } from './useAccessibilityPreferences';

/**
 * Updates the current user's accessibility preferences.
 *
 * Implements optimistic updates for immediate UI feedback.
 * Changes are automatically audit-logged via database trigger (HIPAA compliance).
 *
 * @returns Mutation result with update function
 */
export function useUpdateAccessibilityPreferences() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AccessibilityPreferences): Promise<void> => {
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
          mobility_aid: input.mobilityAid,
          needs_door_assistance: input.needsDoorAssistance,
          needs_package_assistance: input.needsPackageAssistance,
          extra_vehicle_space: input.extraVehicleSpace,
          special_equipment_notes: input.specialEquipmentNotes,
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
      await queryClient.cancelQueries({ queryKey: accessibilityKeys.detail(user?.id ?? '') });

      // Snapshot previous value
      const previousPrefs = queryClient.getQueryData<AccessibilityPreferences>(
        accessibilityKeys.detail(user?.id ?? '')
      );

      // Optimistically update preferences
      queryClient.setQueryData(accessibilityKeys.detail(user?.id ?? ''), newData);

      return { previousPrefs };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousPrefs) {
        queryClient.setQueryData(accessibilityKeys.detail(user?.id ?? ''), context.previousPrefs);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: accessibilityKeys.detail(user?.id ?? '') });
    },
  });
}
