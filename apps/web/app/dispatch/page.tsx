/**
 * Dispatch Overview (Story 3.12)
 *
 * High-level summary for the signed-in dispatcher: counts of pending rides,
 * active drivers, unresolved no-shows. Deep links into the per-area pages.
 */

import Link from 'next/link';

import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function fetchCounts() {
  try {
    const supabase = await getServerSupabase();

    const [pendingRes, activeRes, noShowRes] = await Promise.all([
      supabase
        .from('rides')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'pending_acceptance']),
      supabase
        .from('rides')
        .select('id', { count: 'exact', head: true })
        .in('status', ['assigned', 'en_route', 'arrived', 'in_progress']),
      supabase.from('rides').select('id', { count: 'exact', head: true }).eq('status', 'no_show'),
    ]);

    return {
      pending: pendingRes.count ?? 0,
      active: activeRes.count ?? 0,
      noShows: noShowRes.count ?? 0,
    };
  } catch {
    return { pending: 0, active: 0, noShows: 0 };
  }
}

interface StatCardProps {
  label: string;
  value: number;
  href: string;
}

function StatCard({ label, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-200 p-5 transition-colors hover:border-blue-400"
    >
      <div className="text-xs font-semibold uppercase text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-zinc-900">{value}</div>
    </Link>
  );
}

export default async function DispatchHome() {
  const counts = await fetchCounts();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Today at a glance</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending bookings" value={counts.pending} href="/dispatch/assignments" />
        <StatCard label="Active trips" value={counts.active} href="/dispatch/fleet" />
        <StatCard label="No-shows to review" value={counts.noShows} href="/dispatch/no-shows" />
      </div>
    </div>
  );
}
