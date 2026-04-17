/**
 * Hook for fetching relationship history between driver and rider
 *
 * Counts completed rides between the current driver and a specific rider.
 * Used to display "You've driven [Name] X times" in RiderProfileCard.
 */

import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../../lib/supabase';

export const riderHistoryKeys = {
  all: ['rider-history'] as const,
  count: (driverId: string, riderId: string) =>
    [...riderHistoryKeys.all, 'count', driverId, riderId] as const,
};

/**
 * Hook to count completed rides between current driver and a rider
 *
 * @param riderId - The rider's internal UUID
 * @returns Query result with count of completed rides
 */
export function useRiderHistory(riderId: string) {
  const { userId } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: riderHistoryKeys.count(userId ?? '', riderId),
    queryFn: async (): Promise<number> => {
      if (!userId || !riderId) return 0;

      // Get driver's internal user ID from clerk_id
      const { data: driverUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

      if (userError || !driverUser) {
        return 0;
      }

      // Count completed rides between this driver and rider
      const { count, error } = await supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .eq('driver_id', driverUser.id)
        .eq('rider_id', riderId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching rider history:', error);
        return 0;
      }

      return count ?? 0;
    },
    enabled: !!userId && !!riderId,
    staleTime: 5 * 60 * 1000, // 5 minutes - relationship doesn't change often
  });
}
