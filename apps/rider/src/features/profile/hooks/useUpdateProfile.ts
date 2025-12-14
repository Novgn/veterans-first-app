/**
 * TanStack Query hook for updating rider profile data.
 *
 * Story 2.12: Rider Profile Management (FR71)
 * Updates user profile including emergency contact information.
 * Implements optimistic updates for smooth UX.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';

import { profileKeys, type RiderProfile } from './useProfile';

// Input type for profile updates
export interface UpdateProfileInput {
  profile_photo_url?: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
}

/**
 * Updates the current user's profile data.
 *
 * Implements optimistic updates for immediate UI feedback.
 * Emergency contact changes are automatically audit-logged via database trigger.
 *
 * @returns Mutation result with update function
 */
export function useUpdateProfile() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<RiderProfile> => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', user.id)
        .select(
          `
          id,
          clerk_id,
          first_name,
          last_name,
          phone,
          email,
          profile_photo_url,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship,
          created_at,
          updated_at
        `
        )
        .single();

      if (error) throw error;
      return data as RiderProfile;
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.detail(user?.id ?? '') });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<RiderProfile>(
        profileKeys.detail(user?.id ?? '')
      );

      // Optimistically update profile
      if (previousProfile) {
        queryClient.setQueryData<RiderProfile>(profileKeys.detail(user?.id ?? ''), {
          ...previousProfile,
          ...newData,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(user?.id ?? ''), context.previousProfile);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(user?.id ?? '') });
    },
  });
}
