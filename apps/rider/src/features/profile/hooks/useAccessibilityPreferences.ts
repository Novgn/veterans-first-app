/**
 * TanStack Query hook for fetching rider accessibility preferences.
 *
 * Story 2.13: Accessibility Preferences (FR72)
 * Fetches mobility aid and assistance preferences from rider_preferences table.
 */

import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../../../lib/supabase';

// Valid mobility aid values
export type MobilityAidType =
  | 'none'
  | 'cane'
  | 'walker'
  | 'manual_wheelchair'
  | 'power_wheelchair'
  | null;

// Accessibility preferences shape
export interface AccessibilityPreferences {
  mobilityAid: MobilityAidType;
  needsDoorAssistance: boolean;
  needsPackageAssistance: boolean;
  extraVehicleSpace: boolean;
  specialEquipmentNotes: string | null;
}

// Query key factory pattern (from architecture)
export const accessibilityKeys = {
  all: ['accessibility-preferences'] as const,
  detail: (userId: string) => [...accessibilityKeys.all, userId] as const,
};

/**
 * Fetches the current user's accessibility preferences.
 *
 * Uses clerk_id to find the user, then fetches their rider_preferences.
 * Returns default values if no preferences are set.
 *
 * @returns Query result with accessibility preferences data
 */
export function useAccessibilityPreferences() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: accessibilityKeys.detail(user?.id ?? ''),
    queryFn: async (): Promise<AccessibilityPreferences | null> => {
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

      // Fetch accessibility preferences from rider_preferences
      const { data, error } = await supabase
        .from('rider_preferences')
        .select(
          `
          mobility_aid,
          needs_door_assistance,
          needs_package_assistance,
          extra_vehicle_space,
          special_equipment_notes
        `
        )
        .eq('user_id', userData.id)
        .single();

      // PGRST116 = no rows returned, return defaults
      if (error && error.code === 'PGRST116') {
        return {
          mobilityAid: null,
          needsDoorAssistance: false,
          needsPackageAssistance: false,
          extraVehicleSpace: false,
          specialEquipmentNotes: null,
        };
      }

      if (error) throw error;

      return {
        mobilityAid: (data?.mobility_aid as MobilityAidType) ?? null,
        needsDoorAssistance: data?.needs_door_assistance ?? false,
        needsPackageAssistance: data?.needs_package_assistance ?? false,
        extraVehicleSpace: data?.extra_vehicle_space ?? false,
        specialEquipmentNotes: data?.special_equipment_notes ?? null,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
