import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { SectionNav, type SectionNavItem } from '@/components/shared/SectionNav';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const BUSINESS_NAV: SectionNavItem[] = [
  { href: '/business', label: 'Dashboard' },
  { href: '/business/billing', label: 'Billing' },
  { href: '/business/drivers', label: 'Drivers' },
  { href: '/business/compliance', label: 'Compliance' },
  { href: '/business/reports', label: 'Reports' },
  { href: '/business/settings', label: 'Settings' },
];

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  // Business operations are owned by admins until a separate role exists.
  if (user.role !== 'admin') {
    redirect('/');
  }

  const hdrs = await headers();
  const activePath = hdrs.get('x-next-pathname') ?? '/business';

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">Business</h1>
        <p className="text-sm text-zinc-600">Billing, payroll, reports, and compliance.</p>
      </div>
      <div className="flex gap-6">
        <SectionNav items={BUSINESS_NAV} activePath={activePath} testId="business-nav" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
