/**
 * useDriverProfile + useUpdateDriverProfile (Story 3.11)
 *
 * Unified view over the two tables that describe a driver:
 *   - `users` (personal info shared across all roles)
 *   - `driver_profiles` (vehicle info + bio + years of experience)
 *
 * Read path joins both. Update path fans out to both tables atomically
 * (best-effort: on failure the UI surfaces the error and will refetch).
 */

import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  profilePhotoUrl: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string | null;
  vehicleColor: string;
  vehiclePlate: string;
  bio: string | null;
  yearsExperience: string | null;
  isActive: boolean;
}

export interface DriverProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  profilePhotoUrl?: string | null;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string | null;
  vehicleColor?: string;
  vehiclePlate?: string;
  bio?: string | null;
  yearsExperience?: string | null;
}

export const driverProfileKeys = {
  all: ['driver-profile'] as const,
  current: (userId: string) => [...driverProfileKeys.all, 'current', userId] as const,
};

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  profile_photo_url: string | null;
}

interface DriverProfileRow {
  id: string;
  user_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string | null;
  vehicle_color: string;
  vehicle_plate: string;
  bio: string | null;
  years_experience: string | null;
  is_active: boolean;
}

export function useDriverProfile() {
  const { userId } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: driverProfileKeys.current(userId ?? ''),
    queryFn: async (): Promise<DriverProfile | null> => {
      if (!userId) return null;

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone, email, profile_photo_url')
        .eq('clerk_id', userId)
        .single();

      if (userError || !userRow) return null;

      const user = userRow as UserRow;

      const { data: profileRow, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const profile = (profileRow as DriverProfileRow | null) ?? null;

      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        profilePhotoUrl: user.profile_photo_url,
        vehicleMake: profile?.vehicle_make ?? '',
        vehicleModel: profile?.vehicle_model ?? '',
        vehicleYear: profile?.vehicle_year ?? null,
        vehicleColor: profile?.vehicle_color ?? '',
        vehiclePlate: profile?.vehicle_plate ?? '',
        bio: profile?.bio ?? null,
        yearsExperience: profile?.years_experience ?? null,
        isActive: profile?.is_active ?? false,
      };
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateDriverProfile() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: DriverProfileUpdate) => {
      if (!userId) throw new Error('Not authenticated');

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !userRow) throw new Error('User not found');

      const now = new Date().toISOString();

      const userPatch: Record<string, unknown> = { updated_at: now };
      if (update.firstName !== undefined) userPatch.first_name = update.firstName;
      if (update.lastName !== undefined) userPatch.last_name = update.lastName;
      if (update.email !== undefined) userPatch.email = update.email;
      if (update.profilePhotoUrl !== undefined)
        userPatch.profile_photo_url = update.profilePhotoUrl;

      if (Object.keys(userPatch).length > 1) {
        const { error } = await supabase.from('users').update(userPatch).eq('id', userRow.id);
        if (error) throw error;
      }

      const profilePatch: Record<string, unknown> = { updated_at: now };
      if (update.vehicleMake !== undefined) profilePatch.vehicle_make = update.vehicleMake;
      if (update.vehicleModel !== undefined) profilePatch.vehicle_model = update.vehicleModel;
      if (update.vehicleYear !== undefined) profilePatch.vehicle_year = update.vehicleYear;
      if (update.vehicleColor !== undefined) profilePatch.vehicle_color = update.vehicleColor;
      if (update.vehiclePlate !== undefined) profilePatch.vehicle_plate = update.vehiclePlate;
      if (update.bio !== undefined) profilePatch.bio = update.bio;
      if (update.yearsExperience !== undefined)
        profilePatch.years_experience = update.yearsExperience;

      if (Object.keys(profilePatch).length > 1) {
        const { error } = await supabase
          .from('driver_profiles')
          .update(profilePatch)
          .eq('user_id', userRow.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverProfileKeys.all });
    },
  });
}
