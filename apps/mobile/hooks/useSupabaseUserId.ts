import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

/**
 * Resolves the current Clerk-authenticated user to their internal Supabase
 * `users.id` UUID.
 *
 * Most Supabase queries can rely on RLS policies that do the lookup server-
 * side via `clerk_id = auth.jwt()->>'sub'`. Realtime channel filters however
 * operate directly on the physical column type (`rider_id`/`driver_id` UUID),
 * so any hook that subscribes to realtime changes has to know the user's
 * UUID client-side first.
 *
 * Safe to call before the user's `users` row exists (e.g., just after sign-up
 * while the Clerk webhook is still inserting) — returns `null` in that case.
 */
export function useSupabaseUserId() {
  const supabase = useSupabase();
  const { userId: clerkId } = useAuth();

  return useQuery({
    queryKey: ['supabase-user-id', clerkId],
    queryFn: async () => {
      if (!clerkId) return null;
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .maybeSingle();
      if (error) throw error;
      return (data?.id as string | undefined) ?? null;
    },
    enabled: !!clerkId,
    staleTime: 60 * 60 * 1000, // 1 hour — the mapping rarely changes.
  });
}
