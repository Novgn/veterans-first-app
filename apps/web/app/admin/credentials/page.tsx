/**
 * Credentials list (Story 5.9).
 *
 * Every driver with at least one credential + earliest expiration +
 * warning badges for expiring_30_days / expired / missing entries.
 */

import Link from 'next/link';

import {
  classifyCredential,
  REQUIRED_CREDENTIAL_TYPES,
  type CredentialClassification,
} from '@veterans-first/shared/utils';

import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface DriverRow {
  id: string;
  first_name: string;
  last_name: string;
  credentials: Array<{
    id: string;
    credential_type: string;
    verification_status: string;
    expiration_date: string | null;
  }>;
}

async function fetchDrivers(): Promise<DriverRow[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, driver_credentials(id, credential_type, verification_status, expiration_date)',
      )
      .eq('role', 'driver')
      .order('last_name');
    const rows =
      (data as unknown as Array<{
        id: string;
        first_name: string;
        last_name: string;
        driver_credentials: Array<{
          id: string;
          credential_type: string;
          verification_status: string;
          expiration_date: string | null;
        }> | null;
      }> | null) ?? [];
    return rows.map((row) => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      credentials: row.driver_credentials ?? [],
    }));
  } catch {
    return [];
  }
}

function summarizeWorstClassification(
  credentials: DriverRow['credentials'],
): CredentialClassification {
  const today = new Date();
  const missingRequired = new Set<string>(REQUIRED_CREDENTIAL_TYPES);
  let worst: CredentialClassification = 'ok';
  for (const c of credentials) {
    missingRequired.delete(c.credential_type);
    const classification = classifyCredential({
      expirationDate: c.expiration_date,
      verificationStatus: c.verification_status,
      today,
    });
    if (classification === 'expired') return 'expired';
    if (classification === 'expiring_30_days') worst = 'expiring_30_days';
    if (classification === 'unknown' && worst === 'ok') worst = 'unknown';
  }
  if (missingRequired.size > 0 && worst === 'ok') return 'unknown';
  return worst;
}

function badgeClasses(classification: CredentialClassification): string {
  switch (classification) {
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'expiring_30_days':
      return 'bg-amber-100 text-amber-900';
    case 'unknown':
      return 'bg-zinc-100 text-zinc-700';
    default:
      return 'bg-green-100 text-green-800';
  }
}

function label(classification: CredentialClassification): string {
  switch (classification) {
    case 'expired':
      return 'Expired';
    case 'expiring_30_days':
      return 'Expiring <30d';
    case 'unknown':
      return 'Needs review';
    default:
      return 'OK';
  }
}

export default async function CredentialsListPage() {
  const drivers = await fetchDrivers();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Credentials</h2>
        <p className="text-sm text-zinc-600">
          Driver license, insurance, and background check status per driver.
        </p>
      </div>

      {drivers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No drivers yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Required</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const classification = summarizeWorstClassification(d.credentials);
                const requiredCount = d.credentials.filter((c) =>
                  (REQUIRED_CREDENTIAL_TYPES as readonly string[]).includes(c.credential_type),
                ).length;
                return (
                  <tr key={d.id} className="border-t border-zinc-100">
                    <td className="px-4 py-2">
                      {d.last_name}, {d.first_name}
                    </td>
                    <td className="px-4 py-2">
                      {requiredCount} / {REQUIRED_CREDENTIAL_TYPES.length}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClasses(
                          classification,
                        )}`}
                      >
                        {label(classification)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/credentials/${d.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
