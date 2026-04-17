/**
 * Billing list (Story 5.4)
 *
 * Paginated invoice list filtered by status. Per-ride invoices are the
 * common case; consolidated invoices (Story 5.6) show up with billing
 * period weekly/monthly.
 */

import Link from 'next/link';

import { formatMoneyCents, humanStatus } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  total_cents: number;
  status: string;
  billing_period: string;
  due_date: string;
  created_at: string;
  users: { first_name: string; last_name: string } | null;
}

async function fetchInvoices(status: string): Promise<InvoiceRow[]> {
  try {
    const supabase = await getServerSupabase();
    let query = supabase
      .from('invoices')
      .select(
        'id, invoice_number, total_cents, status, billing_period, due_date, created_at, users:rider_id(first_name, last_name)',
      )
      .order('created_at', { ascending: false })
      .limit(200);
    if (status) query = query.eq('status', status);
    const { data } = await query;
    return ((data as unknown as InvoiceRow[]) ?? []).map((row) => ({
      ...row,
      users: Array.isArray(row.users) ? (row.users[0] ?? null) : row.users,
    }));
  } catch {
    return [];
  }
}

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default async function BillingPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status = '' } = await props.searchParams;
  const invoices = await fetchInvoices(status);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Billing</h2>
        <p className="text-sm text-zinc-600">All invoices, newest first.</p>
      </div>

      <form action="/business/billing" method="get" className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <label
            key={f.value}
            className={`inline-flex cursor-pointer items-center rounded-md border px-3 py-1 text-xs font-medium ${
              f.value === status
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-zinc-300 text-zinc-600'
            }`}
          >
            <input
              type="radio"
              name="status"
              value={f.value}
              defaultChecked={f.value === status}
              className="sr-only"
            />
            {f.label}
          </label>
        ))}
        <button
          type="submit"
          className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-semibold text-white"
        >
          Apply
        </button>
      </form>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No invoices yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Rider</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Due</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2 font-mono text-xs">{inv.invoice_number}</td>
                  <td className="px-4 py-2">
                    {inv.users ? `${inv.users.last_name}, ${inv.users.first_name}` : '—'}
                  </td>
                  <td className="px-4 py-2 text-xs">{humanStatus(inv.billing_period)}</td>
                  <td className="px-4 py-2">{formatMoneyCents(inv.total_cents)}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                      {humanStatus(inv.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{inv.due_date}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/business/billing/${inv.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View
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
