import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { ADMIN_HOST, MARKETING_HOST } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

// Role dispatcher for the admin-host root (spec: docs/superpowers/specs/
// 2026-07-03-admin-subdomain-design.md §3). Middleware sends
// admin.vf1st.com/ here; staff fan out to their section, everyone else
// exits to marketing. This page is also the loop-breaker: the section
// layouts redirect('/') on wrong-role, and on the admin host '/' lands
// back here — which never sends a non-staff user into a console section.
export default async function ConsolePage() {
  // Distinguish "no session" from "signed in without a role":
  // getCurrentUserWithRole() returns null for BOTH, but only the
  // signed-out case may go to /sign-in — Clerk's <SignIn
  // fallbackRedirectUrl="/console"> bounces authenticated visitors
  // straight back here, which would loop for a roleless session
  // (e.g. a fresh signup before the role webhook lands).
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

  // Non-staff (rider/driver/family) and signed-in-but-roleless: exit to
  // marketing. On the admin host a relative '/' would bounce straight
  // back here via the middleware root redirect — use the absolute
  // marketing origin.
  const hdrs = await headers();
  const host = hdrs.get('host')?.toLowerCase().split(':')[0] ?? '';
  redirect(host === ADMIN_HOST ? `https://${MARKETING_HOST}/` : '/');
}
