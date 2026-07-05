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

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { log } from '@/lib/logger';
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

interface FetchDriversResult {
  drivers: DriverRow[];
  /** True when the Supabase query itself failed — distinct from a
   *  genuinely empty roster — so the page can render a real error state
   *  instead of silently claiming "no credentials on file". */
  hasError: boolean;
}

async function fetchDrivers(): Promise<FetchDriversResult> {
  try {
    const supabase = await getServerSupabase();
    // `driver_credentials` has two FKs to `users` (driver_id, verified_by),
    // so the embed is ambiguous to PostgREST unless disambiguated — hence
    // `!driver_id`, matching the `users!driver_id` hint style already used
    // by dispatch/fleet/page.tsx for the `rides` table's multiple FKs.
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, driver_credentials!driver_id(id, credential_type, verification_status, expiration_date)',
      )
      .eq('role', 'driver')
      .order('last_name');

    if (error) {
      log.error({ event: 'admin.credentials.list.fail', code: error.code }, error.message);
      return { drivers: [], hasError: true };
    }

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
    return {
      drivers: rows.map((row) => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        credentials: row.driver_credentials ?? [],
      })),
      hasError: false,
    };
  } catch (err) {
    log.error({ event: 'admin.credentials.list.fail' }, (err as Error).message.slice(0, 120));
    return { drivers: [], hasError: true };
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

function badgeVariant(classification: CredentialClassification): BadgeProps['variant'] {
  switch (classification) {
    case 'expired':
      return 'error';
    case 'expiring_30_days':
      return 'warning';
    case 'unknown':
      return 'secondary';
    default:
      return 'success';
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
      return 'Verified';
  }
}

export default async function CredentialsListPage() {
  const { drivers, hasError } = await fetchDrivers();

  const rows = drivers.map((d) => ({
    driver: d,
    classification: summarizeWorstClassification(d.credentials),
  }));
  const expiredCount = rows.filter((r) => r.classification === 'expired').length;
  const expiringCount = rows.filter((r) => r.classification === 'expiring_30_days').length;
  const hasAlerts = expiredCount > 0 || expiringCount > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Credentials</h2>
        <p className="text-body text-ink-secondary">
          Driver license, insurance, and background check status per driver.
        </p>
      </div>

      {hasError ? (
        <Card
          className="border-error bg-error-100 p-8 text-center text-body text-ink"
          role="alert"
          aria-live="polite"
        >
          Unable to load credentials right now. Try refreshing the page, or contact support if this
          keeps happening.
        </Card>
      ) : null}

      {!hasError && hasAlerts ? (
        <div
          className={`flex items-start gap-3 rounded-md border p-4 text-body text-ink ${
            expiredCount > 0 ? 'border-error bg-error-100' : 'border-warning bg-warning-100'
          }`}
          role="alert"
          aria-live="polite"
        >
          <span aria-hidden="true">⚠</span>
          <span>
            {expiredCount > 0
              ? `${expiredCount} driver${expiredCount === 1 ? '' : 's'} with expired credentials`
              : null}
            {expiredCount > 0 && expiringCount > 0 ? ' · ' : null}
            {expiringCount > 0 ? `${expiringCount} expiring within 30 days` : null}. Review and act
            on these below.
          </span>
        </div>
      ) : null}

      {hasError ? null : drivers.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          No credentials on file yet.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body">
              <thead>
                <tr className="border-b border-border-hairline text-left">
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Required
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ driver: d, classification }) => {
                  const requiredCount = d.credentials.filter((c) =>
                    (REQUIRED_CREDENTIAL_TYPES as readonly string[]).includes(c.credential_type),
                  ).length;
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-border-hairline transition-colors last:border-b-0 hover:bg-navy-100"
                    >
                      <td className="px-6 py-4 font-semibold text-ink">
                        {d.last_name}, {d.first_name}
                      </td>
                      <td className="px-6 py-4 text-ink">
                        {requiredCount} / {REQUIRED_CREDENTIAL_TYPES.length}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={badgeVariant(classification)}>
                          {label(classification)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/credentials/${d.id}`}
                          className="font-semibold text-navy hover:text-navy-700"
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
        </Card>
      )}
    </div>
  );
}
