/**
 * TanStack Query hook for fetching rider comfort preferences.
 *
 * Story 2.14: Comfort Preferences (FR73)
 * Fetches temperature, conversation, and music preferences from rider_preferences table.
 */

import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

// Valid preference values
export type TemperaturePreference = 'cool' | 'normal' | 'warm' | null;
export type ConversationPreference = 'quiet' | 'some' | 'chatty' | null;
export type MusicPreference = 'none' | 'soft' | 'any' | null;

// Comfort preferences shape
export interface ComfortPreferences {
  comfortTemperature: TemperaturePreference;
  conversationPreference: ConversationPreference;
  musicPreference: MusicPreference;
  otherNotes: string | null;
}

// Query key factory pattern (from architecture)
export const comfortKeys = {
  all: ['comfort-preferences'] as const,
  detail: (userId: string) => [...comfortKeys.all, userId] as const,
};

/**
 * Fetches the current user's comfort preferences.
 *
 * Uses clerk_id to find the user, then fetches their rider_preferences.
 * Returns default values if no preferences are set.
 *
 * @returns Query result with comfort preferences data
 */
export function useComfortPreferences() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: comfortKeys.detail(user?.id ?? ''),
    queryFn: async (): Promise<ComfortPreferences | null> => {
      if (!user?.id) return null;

      // First get the user's internal ID from clerk_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError) {
        // User not synced to database yet
        if (userError.code === 'PGRST116') {
          console.warn('User not found in database, preferences unavailable');
          return null;
        }
        throw userError;
      }

      // Fetch comfort preferences from rider_preferences
      const { data, error } = await supabase
        .from('rider_preferences')
        .select(
          `
          comfort_temperature,
          conversation_preference,
          music_preference,
          other_notes
        `
        )
        .eq('user_id', userData.id)
        .single();

      // PGRST116 = no rows returned, return defaults
      if (error && error.code === 'PGRST116') {
        return {
          comfortTemperature: null,
          conversationPreference: null,
          musicPreference: null,
          otherNotes: null,
        };
      }

      if (error) throw error;

      return {
        comfortTemperature: (data?.comfort_temperature as TemperaturePreference) ?? null,
        conversationPreference: (data?.conversation_preference as ConversationPreference) ?? null,
        musicPreference: (data?.music_preference as MusicPreference) ?? null,
        otherNotes: data?.other_notes ?? null,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
