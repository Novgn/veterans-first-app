/**
 * Compliance landing (Story 5.12).
 */

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const REPORTS = [
  {
    title: 'Trip documentation',
    description:
      'One row per completed ride with pickup/dropoff timing, driver, mileage, and photo URL.',
    href: '/api/business/compliance/trip-docs.csv',
  },
  {
    title: 'Audit log',
    description: 'Every audit_logs row in the range (user, action, resource, timestamp).',
    href: '/api/business/compliance/audit.csv',
  },
  {
    title: 'HIPAA access',
    description: 'PHI access events (rider record reads, profile access, PHI lookups).',
    href: '/api/business/compliance/hipaa.csv',
  },
  {
    title: 'Credential status',
    description: 'Current credentials for every driver (license/insurance/background).',
    href: '/api/business/compliance/credentials.csv',
  },
];

export default async function CompliancePage(props: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { start = '', end = '' } = await props.searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const defaultStart = start || startOfMonth();
  const defaultEnd = end || today;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Compliance reports</h2>
        <p className="text-sm text-zinc-600">Date range applies to every export below.</p>
      </div>

      <form action="/business/compliance" method="get" className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm">
          Start
          <input
            name="start"
            type="date"
            defaultValue={defaultStart}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          End
          <input
            name="end"
            type="date"
            defaultValue={defaultEnd}
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm"
          />
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white"
        >
          Apply
        </button>
      </form>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {REPORTS.map((r) => (
          <li key={r.href} className="rounded-xl border border-zinc-200 p-4">
            <div className="text-sm font-semibold">{r.title}</div>
            <p className="mt-1 text-xs text-zinc-500">{r.description}</p>
            <Link
              href={`${r.href}?start=${encodeURIComponent(defaultStart)}&end=${encodeURIComponent(defaultEnd)}`}
              className="mt-3 inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-xs"
            >
              Download CSV
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function startOfMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}
