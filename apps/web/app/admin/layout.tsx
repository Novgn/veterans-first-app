import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { SectionNav, type SectionNavItem } from '@/components/shared/SectionNav';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const ADMIN_NAV: SectionNavItem[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/drivers', label: 'Drivers' },
  { href: '/admin/credentials', label: 'Credentials' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/configuration', label: 'Configuration' },
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
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="text-sm text-zinc-600">Driver roster, credentials, and configuration.</p>
      </div>
      <div className="flex gap-6">
        <SectionNav items={ADMIN_NAV} activePath={activePath} testId="admin-nav" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
