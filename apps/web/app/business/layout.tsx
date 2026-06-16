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
    <section className="min-h-screen bg-stone">
      <header className="border-b border-border-hairline bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5">
          <h1 className="text-title-1 font-bold text-ink">Business</h1>
          <p className="text-body text-ink-secondary">Billing, payroll, reports, and compliance.</p>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <SectionNav items={BUSINESS_NAV} activePath={activePath} testId="business-nav" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
