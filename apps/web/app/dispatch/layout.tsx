import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';

const ALLOWED_ROLES = ['dispatcher', 'admin'] as const;

export default async function DispatchLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  if (!(ALLOWED_ROLES as readonly string[]).includes(user.role)) {
    redirect('/');
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">Dispatch</h1>
        <p className="text-sm text-zinc-600">Live fleet, bookings, and assignments.</p>
      </div>
      {children}
    </section>
  );
}
