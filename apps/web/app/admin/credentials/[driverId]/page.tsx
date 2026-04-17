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

import { setCredentialStatus } from '@/lib/admin/verifyCredential';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
        <Link href="/admin/credentials" className="text-sm text-blue-600 hover:underline">
          ← All drivers
        </Link>
        <h2 className="mt-1 text-lg font-semibold">
          {driver.last_name}, {driver.first_name}
        </h2>
        <p className="text-sm text-zinc-600">
          {allRequiredVerified
            ? 'All required credentials verified — driver can be reactivated.'
            : 'Missing one or more required credentials — driver stays inactive.'}
        </p>
      </div>

      {credentials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No credentials on file. Add from the onboarding form (Story 5.3).
        </div>
      ) : (
        <ul className="space-y-4">
          {credentials.map((c) => {
            const classification = classifyCredential({
              expirationDate: c.expiration_date,
              verificationStatus: c.verification_status,
            });
            return (
              <li key={c.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{humanizeCredentialType(c.credential_type)}</div>
                    <div className="text-xs text-zinc-500">
                      {c.credential_number ? `# ${c.credential_number} · ` : ''}
                      issued {c.issued_date ?? '—'} · expires {c.expiration_date ?? '—'}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        classification === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : classification === 'expiring_30_days'
                            ? 'bg-amber-100 text-amber-900'
                            : classification === 'ok'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {classification.replace('_', ' ')}
                    </div>
                    <div className="mt-1 text-zinc-500">Status: {c.verification_status}</div>
                  </div>
                </div>

                {c.document_url ? (
                  <a
                    href={c.document_url}
                    className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View document
                  </a>
                ) : null}

                {c.notes ? (
                  <p className="mt-2 rounded-md bg-zinc-50 p-2 text-xs text-zinc-600">
                    Note: {c.notes}
                  </p>
                ) : null}

                <form action={setCredentialStatus} className="mt-3 flex flex-wrap gap-2 text-sm">
                  <input type="hidden" name="credentialId" value={c.id} />
                  <input type="hidden" name="driverId" value={driverId} />
                  <select
                    name="status"
                    defaultValue={c.verification_status}
                    className="h-9 rounded-md border border-zinc-300 px-2"
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
                    className="h-9 flex-1 rounded-md border border-zinc-300 px-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
