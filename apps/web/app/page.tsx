import { redirect } from 'next/navigation';

import { MarketingHome } from '@/components/marketing/MarketingHome';
import { getCurrentUserWithRole } from '@/lib/auth/current-user';

// Auth-dependent: must run at request time, not build time.
export const dynamic = 'force-dynamic';

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = clerkKey && clerkKey.length > 20 && !clerkKey.includes('placeholder');

export default async function Home() {
  if (hasValidClerkKey) {
    const user = await getCurrentUserWithRole();
    if (user) {
      switch (user.role) {
        case 'dispatcher':
          redirect('/dispatch');
        case 'admin':
          // Admins own /admin and /business; land on /admin and let
          // section nav move to /business when needed.
          redirect('/admin');
        default:
        // Riders, drivers, and family stay here — the mobile app is
        // their tool. Page body explains.
      }
    }
  }

  // Non-logged-in (and non-dispatcher/admin) visitors land on the public
  // marketing site. The "Staff sign in" link in the marketing nav/footer keeps
  // the operations console reachable.
  return <MarketingHome />;
}
