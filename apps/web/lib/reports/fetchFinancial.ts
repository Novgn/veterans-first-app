import 'server-only';

/**
 * Financial aggregate loader (Story 5.11) — fetches the raw rows for a
 * range, hands them to the shared summarizer.
 */

import {
  summarizeFinancialWindow,
  type FinancialWindowSummary,
} from '@veterans-first/shared/utils';

import { getServerSupabase } from '@/lib/supabase';

export interface FinancialRange {
  startIso: string;
  endExclusiveIso: string;
}

export async function loadFinancialSummary(range: FinancialRange): Promise<FinancialWindowSummary> {
  const supabase = await getServerSupabase();

  const [invoicesRes, paymentsRes, earningsRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('total_cents, status, created_at')
      .gte('created_at', range.startIso)
      .lt('created_at', range.endExclusiveIso),
    supabase
      .from('payments')
      .select('amount_cents, status, created_at, refunded_amount_cents, refunded_at')
      .gte('created_at', range.startIso)
      .lt('created_at', range.endExclusiveIso),
    supabase
      .from('driver_earnings')
      .select('net_amount_cents, paid_at, created_at')
      .gte('created_at', range.startIso)
      .lt('created_at', range.endExclusiveIso),
  ]);

  const invoices =
    (invoicesRes.data as Array<{
      total_cents: number;
      status: string;
      created_at: string;
    }> | null) ?? [];
  const payments =
    (paymentsRes.data as Array<{
      amount_cents: number;
      status: string;
      created_at: string;
      refunded_amount_cents: number | null;
      refunded_at: string | null;
    }> | null) ?? [];
  const earnings =
    (earningsRes.data as Array<{
      net_amount_cents: number;
      paid_at: string | null;
      created_at: string;
    }> | null) ?? [];

  return summarizeFinancialWindow({
    invoices: invoices.map((i) => ({
      totalCents: i.total_cents,
      status: i.status,
      createdAt: i.created_at,
    })),
    payments: payments.map((p) => ({
      amountCents: p.amount_cents,
      status: p.status,
      createdAt: p.created_at,
      refundedAmountCents: p.refunded_amount_cents,
      refundedAt: p.refunded_at,
    })),
    earnings: earnings.map((e) => ({
      netAmountCents: e.net_amount_cents,
      paidAt: e.paid_at,
      createdAt: e.created_at,
    })),
  });
}
