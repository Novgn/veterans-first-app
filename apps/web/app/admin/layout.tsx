import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Car, IdCard, LayoutDashboard, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';

import { ConsoleShell, type ConsoleNavGroup } from '@/components/shared/ConsoleShell';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const ADMIN_NAV_GROUPS: ConsoleNavGroup[] = [
  { items: [{ href: '/admin', label: 'Overview', icon: LayoutDashboard }] },
  {
    label: 'Fleet',
    items: [
      { href: '/admin/drivers', label: 'Drivers', icon: Car },
      { href: '/admin/credentials', label: 'Credentials', icon: IdCard },
    ],
  },
  {
    label: 'Organization',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/configuration', label: 'Configuration', icon: Settings },
    ],
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'admin') {
    redirect('/');
  }

  const hdrs = await headers();
  const activePath = hdrs.get('x-next-pathname') ?? '/admin';

  return (
    <ConsoleShell
      sectionLabel="ADMIN"
      navGroups={ADMIN_NAV_GROUPS}
      activePath={activePath}
      testId="admin-nav"
    >
      {children}
    </ConsoleShell>
  );
}
