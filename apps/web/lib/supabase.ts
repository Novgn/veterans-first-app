import 'server-only';

/**
 * Server-side Supabase client factory for the web console.
 *
 * Two flavors:
 *
 *   - `getServerSupabase()` uses the signed-in user's Clerk session token
 *     (via the `supabase` JWT template). RLS enforces per-role access.
 *
 *   - `getServiceRoleSupabase()` uses the service role key — bypassing RLS.
 *     Reserved for webhook handlers and aggregate reads where RLS would be
 *     too restrictive (e.g. a dispatcher seeing every driver location).
 *     Always gate the caller with a manual role check before using.
 */

import { auth } from '@clerk/nextjs/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertConfig(keyName: string, value: string | undefined): asserts value is string {
  if (!value || value.length < 20) {
    throw new Error(`Missing Supabase configuration: ${keyName}. Set it in your environment.`);
  }
}

export async function getServerSupabase(): Promise<SupabaseClient> {
  assertConfig('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
  assertConfig('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey);

  const { getToken } = await auth();

  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'veterans-first-web' } },
    accessToken: async () => (await getToken({ template: 'supabase' })) ?? '',
  });
}

export function getServiceRoleSupabase(): SupabaseClient {
  assertConfig('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
  assertConfig('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'veterans-first-web-service' } },
  });
}
