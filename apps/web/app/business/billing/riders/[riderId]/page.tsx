/**
 * Rider billing detail (Story 5.7).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatDateTime, formatMoneyCents, humanStatus } from '@/lib/format';
import { applyRiderCredit, waiveInvoice } from '@/lib/billing/riderAccount';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Invoice / Stripe payment status → semantic Badge variant. paid/succeeded →
// success, pending/processing/overdue → warning, failed → error, everything
// else → secondary. Color is never the sole signal — the label always shows.
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
        <Link
          href="/business/billing/riders"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← All riders
        </Link>
        <h2 className="mt-1 text-title-2 font-semibold text-ink">
          {rider.last_name}, {rider.first_name}
        </h2>
        <p className="text-body text-ink-secondary">
          {rider.phone}
          {rider.email ? ` · ${rider.email}` : ''}
        </p>
      </div>

      {error ? (
        <div
          className="flex items-start gap-2 rounded-md border border-error bg-error-100 p-3 text-body text-ink"
          role="alert"
        >
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Billing overview</h3>
        <dl className="grid grid-cols-2 gap-2 text-body">
          <dt className="text-ink-secondary">Outstanding</dt>
          <dd className="font-bold text-ink">{formatMoneyCents(outstanding)}</dd>
          <dt className="text-ink-secondary">Credit balance</dt>
          <dd className="font-bold text-ink">
            {formatMoneyCents(account?.credit_balance_cents ?? 0)}
          </dd>
          <dt className="text-ink-secondary">Autopay</dt>
          <dd>
            <Badge variant={account?.autopay_enabled ? 'success' : 'secondary'}>
              {account?.autopay_enabled ? 'On' : 'Off'}
            </Badge>
          </dd>
          <dt className="text-ink-secondary">Billing frequency</dt>
          <dd className="text-ink">{humanStatus(account?.billing_frequency ?? 'per_ride')}</dd>
          <dt className="text-ink-secondary">Default card</dt>
          <dd className="text-ink">
            {account?.default_payment_method_id
              ? `••••${account.default_payment_method_id.slice(-4)}`
              : '—'}
          </dd>
        </dl>
      </Card>

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Apply credit</h3>
        <form action={applyRiderCredit} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="riderId" value={riderId} />
          <Input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            label="Amount (USD)"
            className="w-40"
            required
          />
          <Input name="reason" label="Reason (optional)" className="min-w-48 flex-1" />
          <Button type="submit">Apply credit</Button>
        </form>
      </Card>

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-body text-ink-secondary">No invoices yet.</p>
        ) : (
          <ul className="text-body">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 border-b border-border-hairline py-3 last:border-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/business/billing/${inv.id}`}
                    className="font-mono text-caption font-semibold text-navy hover:underline"
                  >
                    {inv.invoice_number}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-ink-secondary">
                    <span>{formatDateTime(inv.created_at)}</span>
                    <span>· {humanStatus(inv.billing_period)} ·</span>
                    <Badge variant={paymentStatusVariant(inv.status)}>
                      {humanStatus(inv.status)}
                    </Badge>
                    <span>· due {inv.due_date}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-bold text-ink">{formatMoneyCents(inv.total_cents)}</span>
                  {inv.status === 'pending' ? (
                    <form action={waiveInvoice}>
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <input type="hidden" name="riderId" value={riderId} />
                      <input
                        type="hidden"
                        name="reason"
                        value="Waived by admin from rider billing screen"
                      />
                      <Button type="submit" variant="destructive" size="sm">
                        Waive
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3 p-6">
        <h3 className="text-title-3 font-semibold text-ink">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-body text-ink-secondary">No payments on file.</p>
        ) : (
          <ul className="text-body">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-border-hairline py-3 last:border-0"
              >
                <span className="flex flex-wrap items-center gap-2 text-caption text-ink-secondary">
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
