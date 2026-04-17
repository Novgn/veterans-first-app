/**
 * Invoice detail (Stories 5.4 + 5.5 + 5.6 + 5.7)
 *
 * Shows the invoice header, line items, linked payments, and — when
 * Story 5.7 is wired — the credit/adjustment controls.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import { formatDateTime, formatMoneyCents, humanStatus } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
        <Link href="/business/billing" className="text-sm text-blue-600 hover:underline">
          ← All invoices
        </Link>
        <h2 className="mt-1 font-mono text-lg font-semibold">{invoice.invoice_number}</h2>
        <p className="text-sm text-zinc-600">
          Issued {formatDateTime(invoice.created_at)} · Due {invoice.due_date}
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Summary</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-zinc-500">Rider</dt>
          <dd>
            {invoice.users
              ? `${invoice.users.last_name}, ${invoice.users.first_name} — ${invoice.users.phone}`
              : '—'}
          </dd>
          <dt className="text-zinc-500">Period</dt>
          <dd>{humanStatus(invoice.billing_period)}</dd>
          <dt className="text-zinc-500">Status</dt>
          <dd>{humanStatus(invoice.status)}</dd>
          <dt className="text-zinc-500">Paid at</dt>
          <dd>{formatDateTime(invoice.paid_at)}</dd>
          <dt className="text-zinc-500">Subtotal</dt>
          <dd>{formatMoneyCents(invoice.amount_cents)}</dd>
          <dt className="text-zinc-500">Tax</dt>
          <dd>{formatMoneyCents(invoice.tax_cents)}</dd>
          <dt className="text-zinc-500 font-semibold">Total</dt>
          <dd className="font-semibold">{formatMoneyCents(invoice.total_cents)}</dd>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Line items</h3>
        {lineItems.length === 0 ? (
          <p className="text-sm text-zinc-500">No line items.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {lineItems.map((li) => (
              <li key={li.id} className="flex justify-between border-b border-zinc-100 py-1">
                <span>{li.description}</span>
                <span>{formatMoneyCents(li.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">No payment attempts yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-zinc-100 py-1">
                <span>
                  {formatDateTime(p.created_at)} · {humanStatus(p.status)}
                  {p.payment_method_type ? ` · ${p.payment_method_type}` : ''}
                </span>
                <span>{formatMoneyCents(p.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
