/**
 * Invoice detail (Stories 5.4 + 5.5 + 5.6 + 5.7)
 *
 * Shows the invoice header, line items, linked payments, and — when
 * Story 5.7 is wired — the credit/adjustment controls.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDateTime, formatMoneyCents, humanStatus } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Invoice / Stripe payment status → semantic Badge variant. paid/succeeded →
// success, pending/processing/overdue → warning, failed → error, everything
// else (draft/sent/etc.) → secondary. Color is never the sole signal — the
// badge always carries the human-readable status label.
function paymentStatusVariant(status: string): BadgeProps['variant'] {
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

async function fetchInvoice(invoiceId: string) {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('invoices')
      .select(
        'id, invoice_number, total_cents, amount_cents, tax_cents, status, billing_period, due_date, paid_at, created_at, period_start, period_end, rider_id, users:rider_id(first_name, last_name, phone)',
      )
      .eq('id', invoiceId)
      .maybeSingle();
    if (!data) return null;
    const row = data as unknown as {
      id: string;
      invoice_number: string;
      total_cents: number;
      amount_cents: number;
      tax_cents: number;
      status: string;
      billing_period: string;
      due_date: string;
      paid_at: string | null;
      created_at: string;
      period_start: string | null;
      period_end: string | null;
      rider_id: string;
      users: { first_name: string; last_name: string; phone: string } | null;
    };
    return {
      ...row,
      users: Array.isArray(row.users) ? (row.users[0] ?? null) : row.users,
    };
  } catch {
    return null;
  }
}

async function fetchLineItems(invoiceId: string) {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('invoice_line_items')
      .select('id, description, amount_cents, ride_id, created_at')
      .eq('invoice_id', invoiceId)
      .order('created_at');
    return (
      (data as Array<{
        id: string;
        description: string;
        amount_cents: number;
        ride_id: string | null;
      }> | null) ?? []
    );
  } catch {
    return [];
  }
}

async function fetchPayments(invoiceId: string) {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('payments')
      .select('id, amount_cents, status, payment_method_type, created_at, failure_reason')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });
    return (
      (data as Array<{
        id: string;
        amount_cents: number;
        status: string;
        payment_method_type: string | null;
        created_at: string;
        failure_reason: string | null;
      }> | null) ?? []
    );
  } catch {
    return [];
  }
}

export default async function InvoiceDetailPage(props: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await props.params;
  const [invoice, lineItems, payments] = await Promise.all([
    fetchInvoice(invoiceId),
    fetchLineItems(invoiceId),
    fetchPayments(invoiceId),
  ]);
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/business/billing"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← All invoices
        </Link>
        <h2 className="mt-1 font-mono text-title-2 font-semibold text-ink">
          {invoice.invoice_number}
        </h2>
        <p className="text-body text-ink-secondary">
          Issued {formatDateTime(invoice.created_at)} · Due {invoice.due_date}
        </p>
      </div>

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Summary</h3>
        <dl className="grid grid-cols-2 gap-2 text-body">
          <dt className="text-ink-secondary">Rider</dt>
          <dd className="text-ink">
            {invoice.users
              ? `${invoice.users.last_name}, ${invoice.users.first_name} — ${invoice.users.phone}`
              : '—'}
          </dd>
          <dt className="text-ink-secondary">Period</dt>
          <dd className="text-ink">{humanStatus(invoice.billing_period)}</dd>
          <dt className="text-ink-secondary">Status</dt>
          <dd>
            <Badge variant={paymentStatusVariant(invoice.status)}>
              {humanStatus(invoice.status)}
            </Badge>
          </dd>
          <dt className="text-ink-secondary">Paid at</dt>
          <dd className="text-ink">{formatDateTime(invoice.paid_at)}</dd>
          <dt className="text-ink-secondary">Subtotal</dt>
          <dd className="text-ink">{formatMoneyCents(invoice.amount_cents)}</dd>
          <dt className="text-ink-secondary">Tax</dt>
          <dd className="text-ink">{formatMoneyCents(invoice.tax_cents)}</dd>
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-bold text-ink">{formatMoneyCents(invoice.total_cents)}</dd>
        </dl>
      </Card>

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Line items</h3>
        {lineItems.length === 0 ? (
          <p className="text-body text-ink-secondary">No line items.</p>
        ) : (
          <ul className="text-body">
            {lineItems.map((li) => (
              <li
                key={li.id}
                className="flex justify-between border-b border-border-hairline py-2 last:border-0"
              >
                <span className="text-ink">{li.description}</span>
                <span className="font-bold text-ink">{formatMoneyCents(li.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-body text-ink-secondary">No payment attempts yet.</p>
        ) : (
          <ul className="text-body">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-border-hairline py-2 last:border-0"
              >
                <span className="flex flex-wrap items-center gap-2 text-ink-secondary">
                  {formatDateTime(p.created_at)}
                  <Badge variant={paymentStatusVariant(p.status)}>{humanStatus(p.status)}</Badge>
                  {p.payment_method_type ? <span>· {p.payment_method_type}</span> : null}
                </span>
                <span className="font-bold text-ink">{formatMoneyCents(p.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
