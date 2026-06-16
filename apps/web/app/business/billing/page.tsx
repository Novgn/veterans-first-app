/**
 * Billing list (Story 5.4)
 *
 * Paginated invoice list filtered by status. Per-ride invoices are the
 * common case; consolidated invoices (Story 5.6) show up with billing
 * period weekly/monthly.
 */

import Link from 'next/link';

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatMoneyCents, humanStatus } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Map an invoice / Stripe payment status to a semantic Badge variant.
// paid/succeeded → success, pending/processing → warning, failed → error,
// draft/sent/other → secondary. Color is never the sole signal — the badge
// always carries the human-readable status label.
function invoiceStatusVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'paid':
    case 'succeeded':
      return 'success';
    case 'pending':
    case 'processing':
    case 'overdue':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'secondary';
  }
}

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
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Billing</h2>
        <p className="text-body text-ink-secondary">All invoices, newest first.</p>
      </div>

      <form action="/business/billing" method="get" className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <label
            key={f.value}
            className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-caption font-semibold transition-colors ${
              f.value === status
                ? 'border-navy bg-navy text-white'
                : 'border-border-strong text-ink hover:bg-navy-100'
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
        <Button type="submit" size="sm">
          Apply
        </Button>
      </form>

      {invoices.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          No invoices yet. Generate your first.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-body">
            <thead className="border-b border-border-hairline text-left">
              <tr className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border-hairline transition-colors last:border-0 hover:bg-navy-100"
                >
                  <td className="px-4 py-3 font-mono text-caption text-ink">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {inv.users ? `${inv.users.last_name}, ${inv.users.first_name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-caption text-ink-secondary">
                    {humanStatus(inv.billing_period)}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">
                    {formatMoneyCents(inv.total_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={invoiceStatusVariant(inv.status)}>
                      {humanStatus(inv.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{inv.due_date}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/business/billing/${inv.id}`}
                      className="text-callout font-semibold text-navy hover:underline"
                    >
                      View
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
