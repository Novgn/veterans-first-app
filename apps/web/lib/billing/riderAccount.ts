'use server';

/**
 * Rider payment account admin actions (Story 5.7).
 *
 * Admin-only mutations to apply credit or waive a pending invoice.
 * Each writes an audit_logs row so the support trail is auditable.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { applyCreditDelta, validateAdminCreditInput } from '@veterans-first/shared/utils';

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

export async function applyRiderCredit(formData: FormData): Promise<void> {
  const riderId = String(formData.get('riderId') ?? '');
  const amountRaw = String(formData.get('amount') ?? '');
  const reason = String(formData.get('reason') ?? '')
    .trim()
    .slice(0, 280);

  const actorId = await requireAdminId();
  if (!actorId || !riderId) {
    redirect(`/business/billing/riders/${riderId}?error=forbidden`);
  }

  const validation = validateAdminCreditInput(amountRaw);
  if (!validation.ok) {
    redirect(`/business/billing/riders/${riderId}?error=${validation.reason}`);
  }

  const supabase = getServiceRoleSupabase();

  const accountRes = await supabase
    .from('rider_payment_accounts')
    .select('id, credit_balance_cents')
    .eq('rider_id', riderId)
    .maybeSingle();

  const existing = accountRes.data as { id: string; credit_balance_cents: number } | null;
  const nextBalance = applyCreditDelta({
    currentBalanceCents: existing?.credit_balance_cents ?? 0,
    deltaCents: validation.cents,
  });

  if (existing) {
    await supabase
      .from('rider_payment_accounts')
      .update({
        credit_balance_cents: nextBalance.nextBalanceCents,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('rider_payment_accounts').insert({
      rider_id: riderId,
      credit_balance_cents: nextBalance.nextBalanceCents,
    });
  }

  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'rider_credit_applied',
    resource_type: 'rider_payment_accounts',
    resource_id: riderId,
    new_values: {
      deltaCents: validation.cents,
      nextBalanceCents: nextBalance.nextBalanceCents,
      reason,
    },
  });

  log.info(
    {
      event: 'billing.riderAccount.credit',
      riderLen: riderId.length,
      deltaLen: validation.cents.toString().length,
    },
    'credit applied',
  );

  revalidatePath(`/business/billing/riders/${riderId}`);
  revalidatePath('/business/billing');
}

export async function waiveInvoice(formData: FormData): Promise<void> {
  const invoiceId = String(formData.get('invoiceId') ?? '');
  const riderId = String(formData.get('riderId') ?? '');
  const reason = String(formData.get('reason') ?? '')
    .trim()
    .slice(0, 280);

  const actorId = await requireAdminId();
  if (!actorId || !invoiceId) {
    redirect(`/business/billing/${invoiceId}?error=forbidden`);
  }

  const supabase = getServiceRoleSupabase();
  await supabase
    .from('invoices')
    .update({ status: 'cancelled' })
    .eq('id', invoiceId)
    .eq('status', 'pending');

  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'invoice_waived',
    resource_type: 'invoices',
    resource_id: invoiceId,
    new_values: { reason },
  });

  revalidatePath(`/business/billing/${invoiceId}`);
  if (riderId) revalidatePath(`/business/billing/riders/${riderId}`);
}
