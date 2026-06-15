/**
 * Auth-aware Supabase client for the Rider app.
 *
 * Uses Supabase's Third-Party Auth integration with Clerk (Clerk is
 * registered as an OIDC issuer in Supabase dashboard → Authentication →
 * Third-party auth). Supabase accepts Clerk's default session JWT directly
 * — no template configuration is needed.
 *
 * Usage in components:
 * ```typescript
 * import { useSupabase } from '../lib/supabase';
 *
 * function MyComponent() {
 *   const supabase = useSupabase();
 *   // Use supabase client for queries
 * }
 * ```
 */

import { useSession } from '@clerk/clerk-expo';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

// Supabase environment configuration (Expo env vars)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates an auth-aware Supabase client that uses Clerk session tokens via
 * Supabase's Third-Party Auth integration.
 *
 * @param getToken - Function that returns the current Clerk session token
 * @returns Configured Supabase client with auth token injection
 */
export function createSupabaseClient(getToken: () => Promise<string | null>): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Clerk manages sessions
    },
    global: {
      headers: {
        'X-Client-Info': 'veterans-first-rider',
      },
    },
    accessToken: async () => {
      const token = await getToken();
      return token ?? '';
    },
  });
}

/**
 * React hook that provides an auth-aware Supabase client.
 *
 * The client is automatically configured with the current Clerk session
 * and will include the default Clerk JWT in all requests for RLS.
 *
 * @returns Supabase client configured with Clerk authentication
 */
export function useSupabase(): SupabaseClient {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createSupabaseClient(async () => {
      if (!session) return null;
      return session.getToken();
    });
  }, [session]);

  return supabase;
}
