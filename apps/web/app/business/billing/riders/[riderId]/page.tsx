/**
 * Rider billing detail (Story 5.7).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import { formatDateTime, formatMoneyCents, humanStatus } from '@/lib/format';
import { applyRiderCredit, waiveInvoice } from '@/lib/billing/riderAccount';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function fetchRider(riderId: string) {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('users')
    .select('id, first_name, last_name, phone, email')
    .eq('id', riderId)
    .eq('role', 'rider')
    .maybeSingle();
  return data as {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
  } | null;
}

async function fetchAccount(riderId: string) {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('rider_payment_accounts')
    .select(
      'autopay_enabled, billing_frequency, credit_balance_cents, default_payment_method_id, stripe_customer_id',
    )
    .eq('rider_id', riderId)
    .maybeSingle();
  return (
    (data as {
      autopay_enabled: boolean;
      billing_frequency: string;
      credit_balance_cents: number;
      default_payment_method_id: string | null;
      stripe_customer_id: string | null;
    } | null) ?? null
  );
}

async function fetchInvoices(riderId: string) {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_cents, status, due_date, created_at, billing_period')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false })
    .limit(50);
  return (
    (data as Array<{
      id: string;
      invoice_number: string;
      total_cents: number;
      status: string;
      due_date: string;
      created_at: string;
      billing_period: string;
    }> | null) ?? []
  );
}

async function fetchPayments(riderId: string) {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('payments')
    .select('id, amount_cents, status, created_at, payment_method_type')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false })
    .limit(50);
  return (
    (data as Array<{
      id: string;
      amount_cents: number;
      status: string;
      created_at: string;
      payment_method_type: string | null;
    }> | null) ?? []
  );
}

export default async function RiderBillingDetailPage(props: {
  params: Promise<{ riderId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { riderId } = await props.params;
  const { error } = await props.searchParams;
  const [rider, account, invoices, payments] = await Promise.all([
    fetchRider(riderId),
    fetchAccount(riderId),
    fetchInvoices(riderId),
    fetchPayments(riderId),
  ]);
  if (!rider) notFound();

  const outstanding = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((acc, i) => acc + i.total_cents, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/business/billing/riders" className="text-sm text-blue-600 hover:underline">
          ← All riders
        </Link>
        <h2 className="mt-1 text-lg font-semibold">
          {rider.last_name}, {rider.first_name}
        </h2>
        <p className="text-sm text-zinc-600">
          {rider.phone}
          {rider.email ? ` · ${rider.email}` : ''}
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Billing overview</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-zinc-500">Outstanding</dt>
          <dd className="font-semibold">{formatMoneyCents(outstanding)}</dd>
          <dt className="text-zinc-500">Credit balance</dt>
          <dd>{formatMoneyCents(account?.credit_balance_cents ?? 0)}</dd>
          <dt className="text-zinc-500">Autopay</dt>
          <dd>{account?.autopay_enabled ? 'On' : 'Off'}</dd>
          <dt className="text-zinc-500">Billing frequency</dt>
          <dd>{humanStatus(account?.billing_frequency ?? 'per_ride')}</dd>
          <dt className="text-zinc-500">Default card</dt>
          <dd>
            {account?.default_payment_method_id
              ? `••••${account.default_payment_method_id.slice(-4)}`
              : '—'}
          </dd>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Apply credit</h3>
        <form action={applyRiderCredit} className="flex flex-wrap gap-2 text-sm">
          <input type="hidden" name="riderId" value={riderId} />
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount (USD)"
            className="h-10 w-40 rounded-md border border-zinc-300 px-3"
            required
          />
          <input
            name="reason"
            placeholder="Reason (optional)"
            className="h-10 flex-1 rounded-md border border-zinc-300 px-3"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-blue-600 px-4 font-semibold text-white"
          >
            Apply credit
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-zinc-500">No invoices yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 text-sm">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2">
                <div>
                  <Link
                    href={`/business/billing/${inv.id}`}
                    className="font-mono text-xs text-blue-600 hover:underline"
                  >
                    {inv.invoice_number}
                  </Link>
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(inv.created_at)} · {humanStatus(inv.billing_period)} ·{' '}
                    {humanStatus(inv.status)} · due {inv.due_date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatMoneyCents(inv.total_cents)}</span>
                  {inv.status === 'pending' ? (
                    <form action={waiveInvoice}>
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <input type="hidden" name="riderId" value={riderId} />
                      <input
                        type="hidden"
                        name="reason"
                        value="Waived by admin from rider billing screen"
                      />
                      <button
                        type="submit"
                        className="h-8 rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Waive
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments on file.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span className="text-xs text-zinc-500">
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
