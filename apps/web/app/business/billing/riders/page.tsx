/**
 * Rider billing list (Story 5.7).
 *
 * Shows every rider with an outstanding balance (pending+overdue
 * invoices summed) plus last-payment and autopay status, so admins can
 * triage billing issues quickly.
 */

import Link from 'next/link';

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Rider billing</h2>
        <p className="text-sm text-zinc-600">
          Riders with outstanding invoices, sorted by amount owed.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No outstanding balances.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Rider</th>
                <th className="px-4 py-2">Outstanding</th>
                <th className="px-4 py-2">Autopay</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {r.last_name}, {r.first_name}
                  </td>
                  <td className="px-4 py-2">{formatMoneyCents(r.outstanding_cents)}</td>
                  <td className="px-4 py-2">{r.autopay ? 'On' : 'Off'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/business/billing/riders/${r.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
