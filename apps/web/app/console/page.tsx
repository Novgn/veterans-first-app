import { redirect } from 'next/navigation';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';

// Post-sign-in router for staff. Clerk sends signed-in users here (see
// fallbackRedirectUrl on the <SignIn /> page); we forward each role to its
// console. This routing used to live on the public root ("/"); moving it here
// keeps the marketing landing page customer-facing and statically cacheable.
export const dynamic = 'force-dynamic';

export default async function ConsoleRouter() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  switch (user.role) {
    case 'admin':
      // Admins own /admin and /business; land on /admin and use the section
      // nav to reach /business.
      redirect('/admin');
    case 'dispatcher':
      redirect('/dispatch');
    default:
      // Riders, drivers, and family have no web console — the mobile app is
      // their tool. Send them back to the public site.
      redirect('/');
  }
}
