/**
 * TanStack Query hook for fetching rider profile data.
 *
 * Story 2.12: Rider Profile Management (FR71)
 * Fetches user profile including emergency contact information.
 */

import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

// Types for profile data (snake_case for Supabase compatibility)
export interface RiderProfile {
  id: string;
  clerk_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  profile_photo_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  created_at: string;
  updated_at: string;
}

// Query key factory pattern (from architecture)
export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

/**
 * Fetches the current user's profile data.
 *
 * Uses clerk_id to find the user in the database and returns
 * profile information including emergency contact details.
 *
 * @returns Query result with rider profile data
 */
export function useProfile() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: profileKeys.detail(user?.id ?? ''),
    queryFn: async (): Promise<RiderProfile | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('users')
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
        .eq('clerk_id', user.id)
        .single();

      if (error) {
        // User not synced to database yet
        if (error.code === 'PGRST116') {
          console.warn('User not found in database, profile unavailable');
          return null;
        }
        throw error;
      }

      return data as RiderProfile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
