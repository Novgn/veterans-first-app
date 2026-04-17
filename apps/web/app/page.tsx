import Link from 'next/link';
import { redirect } from 'next/navigation';

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

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-8 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Veterans 1st Console</h1>
      <p className="max-w-md text-base text-zinc-600">
        Operations portal for dispatchers, admins, and business staff. Riders, drivers, and family
        members should use the Veterans 1st mobile app.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background hover:bg-zinc-700"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 hover:bg-zinc-100"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
