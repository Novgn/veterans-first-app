/**
 * Compliance landing (Story 5.12).
 */

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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
        <h2 className="text-title-2 font-semibold text-ink">Compliance reports</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Date range applies to every export below.
        </p>
      </div>

      <form action="/business/compliance" method="get" className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-callout font-semibold text-ink">
          Start
          <input
            name="start"
            type="date"
            defaultValue={defaultStart}
            className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-callout font-semibold text-ink">
          End
          <input
            name="end"
            type="date"
            defaultValue={defaultEnd}
            className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
          />
        </label>
        <Button type="submit">Apply</Button>
      </form>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((r) => (
          <li key={r.href}>
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>{r.title}</CardTitle>
                <p className="text-callout text-ink-secondary">{r.description}</p>
              </CardHeader>
              <CardContent className="mt-auto">
                <Link
                  href={`${r.href}?start=${encodeURIComponent(defaultStart)}&end=${encodeURIComponent(defaultEnd)}`}
                >
                  <Button variant="outline" size="sm">
                    Download CSV
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
