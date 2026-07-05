import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  PhoneCall,
  PhoneOutgoing,
  UserRound,
  UserX,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { ConsoleShell, type ConsoleNavGroup } from '@/components/shared/ConsoleShell';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const ALLOWED_ROLES = ['dispatcher', 'admin'] as const;

const DISPATCH_NAV_GROUPS: ConsoleNavGroup[] = [
  { items: [{ href: '/dispatch', label: 'Overview', icon: LayoutDashboard }] },
  {
    label: 'Live Ops',
    items: [
      { href: '/dispatch/fleet', label: 'Fleet Map', icon: Map },
      { href: '/dispatch/assignments', label: 'Assignments', icon: ClipboardList },
      { href: '/dispatch/phone-bookings', label: 'Phone Bookings', icon: PhoneCall },
    ],
  },
  {
    label: 'Riders',
    items: [
      { href: '/dispatch/riders', label: 'Riders', icon: UserRound },
      { href: '/dispatch/confirmations', label: 'Confirmation Calls', icon: PhoneOutgoing },
      { href: '/dispatch/no-shows', label: 'No-Shows', icon: UserX },
    ],
  },
  {
    label: 'Records',
    items: [{ href: '/dispatch/trip-logs', label: 'Trip Logs', icon: FileText }],
  },
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
    <ConsoleShell
      sectionLabel="DISPATCH"
      navGroups={DISPATCH_NAV_GROUPS}
      activePath={activePath}
      testId="dispatch-nav"
    >
      {children}
    </ConsoleShell>
  );
}
