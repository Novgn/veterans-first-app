/**
 * Auth-aware Supabase client for the Driver app.
 *
 * Uses Clerk JWT tokens with the 'supabase' template for RLS authentication.
 * The client is configured to automatically refresh tokens and inject them
 * into all Supabase requests.
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
 * Creates an auth-aware Supabase client that uses Clerk JWT tokens.
 *
 * @param getToken - Function that returns a Clerk session token for the 'supabase' JWT template
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
        'X-Client-Info': 'veterans-first-driver',
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
 * and will include the JWT token in all requests for RLS authentication.
 *
 * @returns Supabase client configured with Clerk authentication
 */
export function useSupabase(): SupabaseClient {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createSupabaseClient(async () => {
      if (!session) return null;
      return session.getToken({ template: 'supabase' });
    });
  }, [session]);

  return supabase;
}
