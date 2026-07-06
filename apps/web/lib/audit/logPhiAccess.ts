import 'server-only';

/**
 * PHI-access audit logging (FR54 — "log all access to rider personal and
 * medical information").
 *
 * The HIPAA compliance export (`/api/business/compliance/hipaa.csv`) filters
 * `audit_logs` on HIPAA_ACCESS_ACTIONS, but nothing ever emitted those actions,
 * so the report was always empty. This helper writes one on each staff read of
 * PHI (a rider profile, a ride, a rider search). Call it from the server
 * component that renders the PHI.
 *
 * Uses the service-role client so the write succeeds regardless of the caller's
 * RLS scope, and NEVER throws — an audit failure must not break a page render
 * (it is logged and swallowed). The action must be one of HIPAA_ACCESS_ACTIONS
 * or it won't appear in the compliance export.
 */

import type { HipaaAccessAction } from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export async function logPhiAccess(
  action: HipaaAccessAction,
  resourceType: string,
  resourceId: string | null,
  meta?: Record<string, unknown>,
): Promise<void> {
  try {
    const user = await getCurrentUserWithRole();
    if (!user) return;

    const supabase = getServiceRoleSupabase();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.clerkUserId)
      .maybeSingle();
    const actorId = (data as { id: string } | null)?.id ?? null;

    await supabase.from('audit_logs').insert({
      user_id: actorId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      new_values: meta ?? null,
    });
  } catch (err) {
    log.warn(
      { event: 'audit.phi_access.error', err: err instanceof Error ? err.message : String(err) },
      'PHI access audit write failed',
    );
  }
}
