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
    <section className="min-h-screen bg-stone">
      <header className="border-b border-border-hairline bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5">
          <h1 className="text-title-1 font-bold text-ink">Admin</h1>
          <p className="text-body text-ink-secondary">
            Driver roster, credentials, and configuration.
          </p>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <SectionNav items={ADMIN_NAV} activePath={activePath} testId="admin-nav" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
