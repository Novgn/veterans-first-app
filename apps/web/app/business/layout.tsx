import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  // Business operations are owned by admins until a separate role exists.
  if (user.role !== 'admin') {
    redirect('/');
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">Business</h1>
        <p className="text-sm text-zinc-600">Billing, payroll, reports, and compliance.</p>
      </div>
      {children}
    </section>
  );
}
