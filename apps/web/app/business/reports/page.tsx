import Link from 'next/link';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

const REPORTS = [
  {
    href: '/business/reports/operations',
    title: 'Operational metrics',
    description: 'Rides, completion rate, no-show rate by window.',
  },
  {
    href: '/business/reports/financial',
    title: 'Financial summary',
    description: 'Revenue, outstanding invoices, driver payouts.',
  },
] as const;

export default function ReportsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Reports</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Operational and financial reporting views.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((r) => (
          <Link key={r.href} href={r.href} className="block">
            <Card className="h-full transition-colors hover:border-border-strong">
              <CardHeader>
                <CardTitle>{r.title}</CardTitle>
                <p className="text-callout text-ink-secondary">{r.description}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
