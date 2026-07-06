'use server';

/**
 * Dispatch ride cancellation (FR37).
 *
 * Dispatchers/admins can cancel a non-terminal ride from the ride detail page.
 * Unlike the other inline dispatch actions this one is fully audited: it uses
 * the service-role client to write the ride + an append-only audit_logs row in
 * one round, and records the acting user, the previous status, and an optional
 * reason. Fails closed if the caller isn't a dispatcher/admin, and refuses to
 * cancel a ride that is already completed, cancelled, or a no-show.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

const CANCELABLE_STATUSES = new Set([
  'pending',
  'confirmed',
  'pending_acceptance',
  'assigned',
  'en_route',
  'in_progress',
  'arrived',
]);

async function resolveDispatcherId(): Promise<string | null> {
  const user = await getCurrentUserWithRole();
  if (!user || (user.role !== 'dispatcher' && user.role !== 'admin')) return null;
  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.clerkUserId)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function cancelRideAction(formData: FormData): Promise<void> {
  const rideId = String(formData.get('rideId') ?? '').trim();
  const reason = String(formData.get('reason') ?? '')
    .trim()
    .slice(0, 500);
  if (!rideId) return;

  const actorId = await resolveDispatcherId();
  if (!actorId) {
    log.warn(
      { event: 'dispatch.ride.cancel.unauthorized' },
      'cancel blocked: not dispatcher/admin',
    );
    return;
  }

  const supabase = getServiceRoleSupabase();
  const { data: existing } = await supabase
    .from('rides')
    .select('status')
    .eq('id', rideId)
    .maybeSingle();
  const previousStatus = (existing as { status: string } | null)?.status;

  if (!previousStatus || !CANCELABLE_STATUSES.has(previousStatus)) {
    log.info({ event: 'dispatch.ride.cancel.skipped', previousStatus }, 'ride not cancelable');
    redirect(`/dispatch/rides/${rideId}`);
  }

  await supabase
    .from('rides')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', rideId);

  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'ride_cancelled',
    resource_type: 'rides',
    resource_id: rideId,
    new_values: {
      previous_status: previousStatus,
      reason: reason || null,
      cancelled_via: 'dispatch',
    },
  });

  log.info({ event: 'dispatch.ride.cancelled' }, 'ride cancelled by dispatch');
  revalidatePath('/dispatch/assignments');
  revalidatePath(`/dispatch/rides/${rideId}`);
  redirect(`/dispatch/rides/${rideId}`);
}
