/**
 * Rider billing list (Story 5.7).
 *
 * Shows every rider with an outstanding balance (pending+overdue
 * invoices summed) plus last-payment and autopay status, so admins can
 * triage billing issues quickly.
 */

import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatMoneyCents } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RiderBillingRow {
  id: string;
  first_name: string;
  last_name: string;
  outstanding_cents: number;
  autopay: boolean;
}

async function fetchRiderBilling(): Promise<RiderBillingRow[]> {
  try {
    const supabase = await getServerSupabase();
    const invoicesRes = await supabase
      .from('invoices')
      .select('rider_id, total_cents, status')
      .in('status', ['pending', 'overdue']);

    const outstanding = new Map<string, number>();
    const rows =
      (invoicesRes.data as Array<{
        rider_id: string;
        total_cents: number;
        status: string;
      }> | null) ?? [];
    for (const row of rows) {
      outstanding.set(row.rider_id, (outstanding.get(row.rider_id) ?? 0) + row.total_cents);
    }

    if (outstanding.size === 0) return [];

    const riderIds = Array.from(outstanding.keys());
    const usersRes = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .in('id', riderIds);

    const accountsRes = await supabase
      .from('rider_payment_accounts')
      .select('rider_id, autopay_enabled')
      .in('rider_id', riderIds);

    const autopayMap = new Map<string, boolean>();
    const accountRows =
      (accountsRes.data as Array<{ rider_id: string; autopay_enabled: boolean }> | null) ?? [];
    for (const r of accountRows) autopayMap.set(r.rider_id, r.autopay_enabled);

    const userRows =
      (usersRes.data as Array<{ id: string; first_name: string; last_name: string }> | null) ?? [];
    return userRows
      .map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        outstanding_cents: outstanding.get(u.id) ?? 0,
        autopay: autopayMap.get(u.id) ?? false,
      }))
      .sort((a, b) => b.outstanding_cents - a.outstanding_cents);
  } catch {
    return [];
  }
}

export default async function RiderBillingListPage() {
  const rows = await fetchRiderBilling();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Rider billing</h2>
        <p className="text-body text-ink-secondary">
          Riders with outstanding invoices, sorted by amount owed.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          No outstanding balances.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-body">
            <thead className="border-b border-border-hairline text-left">
              <tr className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Autopay</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border-hairline transition-colors last:border-0 hover:bg-navy-100"
                >
                  <td className="px-4 py-3 text-ink">
                    {r.last_name}, {r.first_name}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">
                    {formatMoneyCents(r.outstanding_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.autopay ? 'success' : 'secondary'}>
                      {r.autopay ? 'On' : 'Off'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/business/billing/riders/${r.id}`}
                      className="text-callout font-semibold text-navy hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
