import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

export default clerkMiddleware(async (auth, req) => {
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
