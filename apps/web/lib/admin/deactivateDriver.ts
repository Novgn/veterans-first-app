'use server';

/**
 * Driver deactivation server action (Story 5.2).
 *
 * - Requires admin role (fails closed if not).
 * - Uses service-role Supabase client because the write touches
 *   driver_profiles + multiple rides + audit_logs in a single round.
 * - Refuses to deactivate if any ride is currently in progress —
 *   blocking-status rides are left alone so riders aren't stranded.
 * - Append-only audit log records the actor, driver id, and the list of
 *   reassigned rides.
 */

import { revalidatePath } from 'next/cache';

import {
  buildDeactivationAuditPayload,
  classifyDriverRides,
  type DriverRideSummary,
} from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

async function resolveActorUserId(): Promise<string | null> {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') return null;
  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.clerkUserId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function setDriverActiveStatus(formData: FormData): Promise<void> {
  const driverId = String(formData.get('driverId') ?? '');
  const activeStr = String(formData.get('active') ?? '');
  if (!driverId) return;
  const nextActive = activeStr === 'true';

  const actorId = await resolveActorUserId();
  if (!actorId) {
    log.warn({ event: 'admin.driver.setActive.unauthorized' }, 'blocked');
    return;
  }

  const supabase = getServiceRoleSupabase();

  if (!nextActive) {
    const { data: assignedRows } = await supabase
      .from('rides')
      .select('id, status')
      .eq('driver_id', driverId)
      .in('status', [
        'pending',
        'confirmed',
        'assigned',
        'pending_acceptance',
        'en_route',
        'in_progress',
        'arrived',
      ]);

    const classification = classifyDriverRides((assignedRows as DriverRideSummary[] | null) ?? []);

    if (!classification.canDeactivate) {
      log.info(
        {
          event: 'admin.driver.deactivate.blocked',
          blockingLen: classification.blocking.length,
        },
        'deactivate blocked by in-progress rides',
      );
      return;
    }

    if (classification.reassignable.length > 0) {
      const ids = classification.reassignable.map((r) => r.id);
      await supabase
        .from('rides')
        .update({ driver_id: null, status: 'confirmed', updated_at: new Date().toISOString() })
        .in('id', ids);
    }

    await supabase.from('driver_profiles').update({ is_active: false }).eq('user_id', driverId);

    const audit = buildDeactivationAuditPayload(driverId, classification.reassignable);
    await supabase.from('audit_logs').insert({
      user_id: actorId,
      action: 'driver_deactivated',
      resource_type: 'driver_profiles',
      resource_id: driverId,
      new_values: audit,
    });
  } else {
    await supabase.from('driver_profiles').update({ is_active: true }).eq('user_id', driverId);
    await supabase.from('audit_logs').insert({
      user_id: actorId,
      action: 'driver_reactivated',
      resource_type: 'driver_profiles',
      resource_id: driverId,
      new_values: { driverId },
    });
  }

  revalidatePath(`/admin/drivers/${driverId}`);
  revalidatePath('/admin/drivers');
}
