import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { SectionNav, type SectionNavItem } from '@/components/shared/SectionNav';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const ALLOWED_ROLES = ['dispatcher', 'admin'] as const;

const DISPATCH_NAV: SectionNavItem[] = [
  { href: '/dispatch', label: 'Overview' },
  { href: '/dispatch/fleet', label: 'Fleet Map' },
  { href: '/dispatch/assignments', label: 'Assignments' },
  { href: '/dispatch/phone-bookings', label: 'Phone Bookings' },
  { href: '/dispatch/riders', label: 'Riders' },
  { href: '/dispatch/confirmations', label: 'Confirmation Calls' },
  { href: '/dispatch/no-shows', label: 'No-Shows' },
  { href: '/dispatch/trip-logs', label: 'Trip Logs' },
];

export default async function DispatchLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  if (!(ALLOWED_ROLES as readonly string[]).includes(user.role)) {
    redirect('/');
  }

  const hdrs = await headers();
  const activePath = hdrs.get('x-next-pathname') ?? '/dispatch';

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">Dispatch</h1>
        <p className="text-sm text-zinc-600">Live fleet, bookings, and assignments.</p>
      </div>
      <div className="flex gap-6">
        <SectionNav items={DISPATCH_NAV} activePath={activePath} testId="dispatch-nav" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
