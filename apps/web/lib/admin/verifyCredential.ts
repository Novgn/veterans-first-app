'use server';

/**
 * Credential verification action (Story 5.9).
 *
 * Admin-only. Updates verification_status, stamps verifier/verified_at,
 * and writes audit log. If the driver's full required set becomes
 * verified-and-not-expired, this unblocks Story 5.2's reactivate button
 * (activation itself is still manual).
 */

import { revalidatePath } from 'next/cache';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';

async function requireAdminId(): Promise<string | null> {
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

export async function setCredentialStatus(formData: FormData): Promise<void> {
  const credentialId = String(formData.get('credentialId') ?? '');
  const driverId = String(formData.get('driverId') ?? '');
  const status = String(formData.get('status') ?? '');
  const notes = String(formData.get('notes') ?? '')
    .trim()
    .slice(0, 500);

  const actorId = await requireAdminId();
  if (!actorId || !credentialId) return;
  if (!['verified', 'rejected', 'pending', 'expired'].includes(status)) return;

  const supabase = getServiceRoleSupabase();

  await supabase
    .from('driver_credentials')
    .update({
      verification_status: status,
      verified_by: status === 'verified' ? actorId : null,
      verified_at: status === 'verified' ? new Date().toISOString() : null,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', credentialId);

  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'credential_status_changed',
    resource_type: 'driver_credentials',
    resource_id: credentialId,
    new_values: { status, driverId, notesLen: notes.length },
  });

  revalidatePath('/admin/credentials');
  if (driverId) revalidatePath(`/admin/credentials/${driverId}`);
}
