/**
 * Credential alerts (Story 5.9).
 *
 * GET /api/admin/credential-alerts — sweeps every driver_credentials
 * row, classifies it, and writes an audit_logs entry for each
 * expired/expiring credential. Idempotent per day: audit rows key on
 * (credential_id, alert_date), so re-running the cron within the same
 * day only re-inserts rows whose classification changed.
 *
 * Admin-only.
 */

import { NextResponse } from 'next/server';

import { classifyCredential, type CredentialClassification } from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';

interface CredentialRow {
  id: string;
  driver_id: string;
  credential_type: string;
  expiration_date: string | null;
  verification_status: string;
}

export async function GET() {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const supabase = getServiceRoleSupabase();
  const { data } = await supabase
    .from('driver_credentials')
    .select('id, driver_id, credential_type, expiration_date, verification_status');

  const rows = (data as CredentialRow[] | null) ?? [];
  const today = new Date();
  const alertDate = today.toISOString().slice(0, 10);
  let expired = 0;
  let expiring = 0;

  for (const row of rows) {
    const classification = classifyCredential({
      expirationDate: row.expiration_date,
      verificationStatus: row.verification_status,
      today,
    });
    if (classification !== 'expired' && classification !== 'expiring_30_days') continue;

    const key = `${row.id}:${alertDate}:${classification}`;
    const existing = await supabase
      .from('audit_logs')
      .select('id')
      .eq('resource_type', 'driver_credentials')
      .eq('resource_id', row.id)
      .eq('action', alertAction(classification))
      .gte('created_at', `${alertDate}T00:00:00Z`)
      .maybeSingle();

    if (existing.data) continue;

    await supabase.from('audit_logs').insert({
      user_id: null,
      action: alertAction(classification),
      resource_type: 'driver_credentials',
      resource_id: row.id,
      new_values: {
        driverId: row.driver_id,
        credentialType: row.credential_type,
        classification,
        key,
      },
    });

    if (classification === 'expired') expired += 1;
    else expiring += 1;
  }

  return NextResponse.json({ ok: true, expired, expiring, scanned: rows.length });
}

function alertAction(classification: CredentialClassification): string {
  return classification === 'expired' ? 'credential_expired_alert' : 'credential_expiring_alert';
}
