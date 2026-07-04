import { SignOutButton } from '@clerk/nextjs';
import { auth, currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { ADMIN_HOST, MARKETING_HOST } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

// Role dispatcher for the admin-host root (spec: docs/superpowers/specs/
// 2026-07-03-admin-subdomain-design.md §3). Middleware sends
// admin.vf1st.com/ here; staff fan out to their section. This page is
// also the loop-breaker: the section layouts redirect('/') on
// wrong-role, and on the admin host '/' lands back here — which never
// sends a non-staff user into a console section.
export default async function ConsolePage() {
  // Distinguish "no session" from "signed in without a role":
  // getCurrentUserWithRole() returns null for BOTH, but only the
  // signed-out case may go to /sign-in — Clerk's <SignIn
  // fallbackRedirectUrl="/console"> bounces authenticated visitors
  // straight back here, which would loop for a roleless session.
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithRole();

  if (user?.role === 'admin') {
    redirect('/admin'); // admins also own /business today
  }
  if (user?.role === 'dispatcher') {
    redirect('/dispatch');
  }

  if (user) {
    // Known non-staff role (rider/driver/family): the mobile app is their
    // tool, the marketing site their web home. On the admin host a
    // relative '/' would bounce straight back here via the middleware
    // root redirect — use the absolute marketing origin.
    const hdrs = await headers();
    const host = hdrs.get('host')?.toLowerCase().split(':')[0] ?? '';
    redirect(host === ADMIN_HOST ? `https://${MARKETING_HOST}/` : '/');
  }

  // Signed in but no console role assigned yet. Stay on the portal and
  // say so — silently bouncing to the marketing site made "my role isn't
  // set" indistinguishable from "login is broken". An admin grants
  // access from Admin → Users; the webhook then syncs the role.
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-md rounded-sm border border-border-hairline bg-white p-8 text-center">
        <h1 className="text-title-2 font-bold text-ink">No console access yet</h1>
        <p className="mt-3 text-body text-ink-secondary">
          You&apos;re signed in{email ? ` as ${email}` : ''}, but this account doesn&apos;t have a
          console role assigned. Ask an administrator to grant you access from{' '}
          <span className="font-medium">Admin &rarr; Users</span>, then sign in again.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <SignOutButton redirectUrl="/sign-in">
            <button
              type="button"
              className="h-10 rounded-sm bg-ink px-4 text-callout font-medium text-white"
            >
              Sign out
            </button>
          </SignOutButton>
          <a
            href={`https://${MARKETING_HOST}/`}
            className="text-callout font-medium text-ink underline underline-offset-4"
          >
            Go to vf1st.com
          </a>
        </div>
      </div>
    </main>
  );
}
