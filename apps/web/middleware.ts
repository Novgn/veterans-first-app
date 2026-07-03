import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ADMIN_HOST, MARKETING_HOST } from '@/lib/site-config';

// Protected routes for the veterans-first console.
//
// Section layouts (apps/web/app/{dispatch,admin,business}/layout.tsx)
// also call getCurrentUserWithRole() and redirect on wrong-role —
// this matcher is the coarse first gate (auth required), and the
// layouts apply finer per-role checks.
const isProtectedRoute = createRouteMatcher([
  '/dispatch(.*)',
  '/admin(.*)',
  '/business(.*)',
  '/api/me(.*)',
  '/api/notifications(.*)',
]);

// Host canonicalization (spec: docs/superpowers/specs/2026-07-03-admin-
// subdomain-design.md). Consoles are served from ADMIN_HOST; marketing
// from MARKETING_HOST. Requests from any other host (previews,
// localhost) fall through untouched, so this is inert off-production.
const isConsolePath = createRouteMatcher(['/dispatch(.*)', '/admin(.*)', '/business(.*)']);
const isAdminHostAllowed = createRouteMatcher([
  '/dispatch(.*)',
  '/admin(.*)',
  '/business(.*)',
  '/console',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',
  '/trpc/(.*)',
]);

// 308 (permanent, method-preserving) to the same path+query on the
// other production host. Always https — the targets are the real
// production hosts even when testing locally via Host-header injection.
function crossHostRedirect(req: NextRequest, host: string): NextResponse {
  const url = req.nextUrl.clone();
  url.protocol = 'https:';
  url.host = host;
  url.port = '';
  return NextResponse.redirect(url, 308);
}

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get('host')?.toLowerCase().split(':')[0] ?? '';

  if (host === MARKETING_HOST && isConsolePath(req)) {
    return crossHostRedirect(req, ADMIN_HOST);
  }

  if (host === ADMIN_HOST) {
    if (req.nextUrl.pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/console';
      return NextResponse.redirect(url); // 307 — per-user, not canonical
    }
    if (!isAdminHostAllowed(req)) {
      return crossHostRedirect(req, MARKETING_HOST);
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Forward the current pathname so server components (e.g. SectionNav)
  // can highlight the active link without client JS.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-next-pathname', req.nextUrl.pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
