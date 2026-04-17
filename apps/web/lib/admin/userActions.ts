'use server';

/**
 * Staff user management actions (Story 5.16).
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';

import {
  INVITABLE_ROLES,
  validateInviteInput,
  type InvitableRole,
} from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

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

export async function inviteStaffUser(formData: FormData): Promise<void> {
  const actorId = await requireAdminId();
  if (!actorId) redirect('/admin/users?error=forbidden');

  const validation = validateInviteInput({
    email: String(formData.get('email') ?? ''),
    role: String(formData.get('role') ?? ''),
  });
  if (!validation.ok) {
    redirect(`/admin/users/invite?error=${validation.reason}`);
  }

  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: validation.email,
      publicMetadata: { role: validation.role },
      notify: true,
    });
  } catch (err) {
    log.error(
      { event: 'admin.users.invite.fail', msgLen: (err as Error).message.length },
      'clerk fail',
    );
    redirect('/admin/users/invite?error=clerk-fail');
  }

  const supabase = getServiceRoleSupabase();
  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'staff_invited',
    resource_type: 'users',
    resource_id: null,
    new_values: { email: validation.email, role: validation.role },
  });

  revalidatePath('/admin/users');
  redirect('/admin/users?ok=invited');
}

export async function changeUserRole(formData: FormData): Promise<void> {
  const actorId = await requireAdminId();
  const clerkUserId = String(formData.get('clerkUserId') ?? '');
  const roleRaw = String(formData.get('role') ?? '');
  if (!actorId || !clerkUserId) redirect('/admin/users?error=forbidden');
  if (!(INVITABLE_ROLES as readonly string[]).includes(roleRaw)) {
    redirect('/admin/users?error=role-not-allowed');
  }
  const role = roleRaw as InvitableRole;

  try {
    const client = await clerkClient();
    const previous = await client.users.getUser(clerkUserId);
    await client.users.updateUserMetadata(clerkUserId, { publicMetadata: { role } });

    const supabase = getServiceRoleSupabase();
    await supabase.from('users').update({ role }).eq('clerk_id', clerkUserId);
    await supabase.from('audit_logs').insert({
      user_id: actorId,
      action: 'staff_role_changed',
      resource_type: 'users',
      resource_id: null,
      old_values: { role: previous.publicMetadata?.role ?? null, clerkUserId },
      new_values: { role, clerkUserId },
    });
  } catch (err) {
    log.error({ event: 'admin.users.changeRole.fail' }, (err as Error).message.slice(0, 120));
    redirect('/admin/users?error=change-fail');
  }

  revalidatePath('/admin/users');
  redirect('/admin/users?ok=role-changed');
}

export async function resetUserPassword(formData: FormData): Promise<void> {
  const actorId = await requireAdminId();
  const clerkUserId = String(formData.get('clerkUserId') ?? '');
  if (!actorId || !clerkUserId) redirect('/admin/users?error=forbidden');

  try {
    const client = await clerkClient();
    // We rely on Clerk's "forgot password" email flow for the actual
    // reset. The admin action here invalidates existing sessions so
    // the user is forced to re-authenticate, then logs the request so
    // support can follow up if the user doesn't receive the email.
    const sessions = await client.sessions.getSessionList({ userId: clerkUserId });
    for (const session of sessions.data ?? []) {
      if (session.status === 'active') {
        await client.sessions.revokeSession(session.id);
      }
    }
  } catch (err) {
    log.error({ event: 'admin.users.resetPassword.fail' }, (err as Error).message.slice(0, 120));
    redirect('/admin/users?error=reset-fail');
  }

  const supabase = getServiceRoleSupabase();
  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'staff_password_reset',
    resource_type: 'users',
    resource_id: null,
    new_values: { clerkUserId },
  });

  revalidatePath('/admin/users');
  redirect('/admin/users?ok=password-reset');
}
