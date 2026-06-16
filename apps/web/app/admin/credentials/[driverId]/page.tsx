/**
 * Credentials detail (Story 5.9).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  areRequiredCredentialsVerified,
  classifyCredential,
  humanizeCredentialType,
} from '@/lib/admin/credentialDisplay';

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { setCredentialStatus } from '@/lib/admin/verifyCredential';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type CredentialClass = ReturnType<typeof classifyCredential>;

function credentialBadge(classification: CredentialClass): {
  variant: BadgeProps['variant'];
  label: string;
} {
  switch (classification) {
    case 'expired':
      return { variant: 'error', label: 'Expired' };
    case 'expiring_30_days':
      return { variant: 'warning', label: 'Expiring <30d' };
    case 'ok':
      return { variant: 'success', label: 'Verified' };
    default:
      return { variant: 'secondary', label: 'Needs review' };
  }
}

interface CredentialRow {
  id: string;
  credential_type: string;
  credential_number: string | null;
  issued_date: string | null;
  expiration_date: string | null;
  document_url: string | null;
  verification_status: string;
  verified_at: string | null;
  notes: string | null;
  updated_at: string | null;
}

async function fetchDriver(driverId: string) {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('id', driverId)
    .eq('role', 'driver')
    .maybeSingle();
  return data as { id: string; first_name: string; last_name: string } | null;
}

async function fetchCredentials(driverId: string): Promise<CredentialRow[]> {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('driver_credentials')
    .select(
      'id, credential_type, credential_number, issued_date, expiration_date, document_url, verification_status, verified_at, notes, updated_at',
    )
    .eq('driver_id', driverId)
    .order('credential_type');
  return (data as CredentialRow[] | null) ?? [];
}

export default async function CredentialsDriverPage(props: {
  params: Promise<{ driverId: string }>;
}) {
  const { driverId } = await props.params;
  const [driver, credentials] = await Promise.all([
    fetchDriver(driverId),
    fetchCredentials(driverId),
  ]);
  if (!driver) notFound();

  const allRequiredVerified = areRequiredCredentialsVerified(
    credentials.map((c) => ({
      credentialType: c.credential_type,
      verificationStatus: c.verification_status,
      expirationDate: c.expiration_date,
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/credentials"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← All drivers
        </Link>
        <h2 className="mt-1 text-title-2 font-semibold text-ink">
          {driver.last_name}, {driver.first_name}
        </h2>
        <p className="text-body text-ink-secondary">
          {allRequiredVerified
            ? 'All required credentials verified — driver can be reactivated.'
            : 'Missing one or more required credentials — driver stays inactive.'}
        </p>
      </div>

      {credentials.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          No credentials on file yet. Add from the onboarding form (Story 5.3).
        </Card>
      ) : (
        <ul className="space-y-4">
          {credentials.map((c) => {
            const classification = classifyCredential({
              expirationDate: c.expiration_date,
              verificationStatus: c.verification_status,
            });
            const badge = credentialBadge(classification);
            const expiryAlert =
              classification === 'expired'
                ? {
                    tone: 'error' as const,
                    text: `Expired on ${c.expiration_date ?? '—'} — driver cannot be assigned.`,
                  }
                : classification === 'expiring_30_days'
                  ? {
                      tone: 'warning' as const,
                      text: `Expires on ${c.expiration_date ?? '—'} — renew soon.`,
                    }
                  : null;
            return (
              <Card key={c.id} className="space-y-3 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-title-3 font-semibold text-ink">
                      {humanizeCredentialType(c.credential_type)}
                    </div>
                    <div className="text-caption text-ink-secondary">
                      {c.credential_number ? `# ${c.credential_number} · ` : ''}
                      issued {c.issued_date ?? '—'} · expires {c.expiration_date ?? '—'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className="text-caption text-ink-secondary">
                      Status: {c.verification_status}
                    </div>
                  </div>
                </div>

                {expiryAlert ? (
                  <p
                    className={`flex items-start gap-2 rounded-md border p-3 text-body text-ink ${
                      expiryAlert.tone === 'error'
                        ? 'border-error bg-error-100'
                        : 'border-warning bg-warning-100'
                    }`}
                  >
                    <span aria-hidden="true">⚠</span>
                    <span>{expiryAlert.text}</span>
                  </p>
                ) : null}

                {c.document_url ? (
                  <a
                    href={c.document_url}
                    className="inline-block text-callout font-semibold text-navy hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View {humanizeCredentialType(c.credential_type)} document
                  </a>
                ) : null}

                {c.notes ? (
                  <p className="rounded-md bg-stone p-3 text-body text-ink-secondary">
                    Note: {c.notes}
                  </p>
                ) : null}

                <form action={setCredentialStatus} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="credentialId" value={c.id} />
                  <input type="hidden" name="driverId" value={driverId} />
                  <select
                    name="status"
                    defaultValue={c.verification_status}
                    aria-label="Verification status"
                    className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verify</option>
                    <option value="rejected">Reject</option>
                    <option value="expired">Mark expired</option>
                  </select>
                  <input
                    name="notes"
                    defaultValue={c.notes ?? ''}
                    placeholder="Notes (optional)"
                    aria-label="Notes"
                    className="h-12 flex-1 rounded-sm border border-border-strong bg-card px-3 text-body text-ink placeholder:text-ink-secondary"
                  />
                  <Button type="submit">Save</Button>
                </form>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
