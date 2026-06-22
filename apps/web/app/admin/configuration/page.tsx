import Link from 'next/link';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

const SECTIONS = [
  {
    href: '/admin/configuration/service-area',
    title: 'Service area',
    description: 'Define the operating polygon where rides can be booked.',
  },
  {
    href: '/admin/configuration/pricing',
    title: 'Pricing',
    description: 'Base fare, per-mile rate, and included wait time — never surge.',
  },
  {
    href: '/admin/configuration/operating-hours',
    title: 'Operating hours',
    description: 'Per-day open/close hours plus holiday closures.',
  },
] as const;

export default function AdminConfigurationHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Settings</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Configure how the service runs — where we drive, what it costs, and when we operate.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="block">
            <Card className="h-full transition-colors hover:border-border-strong">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <p className="text-callout text-ink-secondary">{section.description}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
