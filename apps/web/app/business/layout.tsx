import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { BarChart3, Car, LayoutDashboard, Receipt, Settings, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { ConsoleShell, type ConsoleNavGroup } from '@/components/shared/ConsoleShell';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const BUSINESS_NAV_GROUPS: ConsoleNavGroup[] = [
  { items: [{ href: '/business', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Finance',
    items: [
      { href: '/business/billing', label: 'Billing', icon: Receipt },
      { href: '/business/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/business/drivers', label: 'Drivers', icon: Car },
      { href: '/business/compliance', label: 'Compliance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Organization',
    items: [{ href: '/admin/configuration', label: 'Configuration', icon: Settings }],
  },
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
    <ConsoleShell
      sectionLabel="BUSINESS"
      navGroups={BUSINESS_NAV_GROUPS}
      activePath={activePath}
      testId="business-nav"
    >
      {children}
    </ConsoleShell>
  );
}
