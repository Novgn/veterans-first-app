/**
 * Auth-aware Supabase client for use with Clerk authentication.
 *
 * This client is configured to work with Clerk JWT tokens,
 * enabling Row Level Security (RLS) policies to identify users via auth.uid().
 *
 * Usage:
 *
 * Mobile (Expo):
 * ```typescript
 * import { useSession } from '@clerk/clerk-expo';
 * import { createSupabaseClient } from '@veterans-first/shared/lib/supabase';
 *
 * const { session } = useSession();
 * const supabase = createSupabaseClient(
 *   () => session?.getToken({ template: 'supabase' }) ?? Promise.resolve(null)
 * );
 * ```
 *
 * Web (Next.js):
 * ```typescript
 * import { auth } from '@clerk/nextjs/server';
 * import { createSupabaseClient } from '@veterans-first/shared/lib/supabase';
 *
 * const { getToken } = await auth();
 * const supabase = createSupabaseClient(
 *   () => getToken({ template: 'supabase' })
 * );
 * ```
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Type for the access token getter function
type GetAccessToken = () => Promise<string | null>;

// Supabase environment configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates an auth-aware Supabase client that uses Clerk JWT tokens.
 *
 * @param getToken - Function that returns a Clerk session token for the 'supabase' JWT template
 * @returns Configured Supabase client with auth token injection
 */
export function createSupabaseClient(getToken: GetAccessToken): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      const token = await getToken();
      return token ?? null;
    },
  });
}

/**
 * Creates an anonymous Supabase client (no auth).
 * Use this for public data access only.
 */
export function createAnonSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Re-export types for convenience
export type { SupabaseClient };
