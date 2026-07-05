import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Lexend } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Veterans 1st Console',
  description:
    'Operations console for Veterans 1st transportation service (dispatch, admin, business).',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Detect placeholder Clerk keys used in CI builds so the build still
// works when the secret isn't injected. Production deploys MUST provide
// a real key.
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = clerkKey && clerkKey.length > 20 && !clerkKey.includes('placeholder');

export default function RootLayout({ children }: { children: ReactNode }) {
  if (!hasValidClerkKey) {
    return (
      <html lang="en" className={lexend.variable}>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" className={lexend.variable}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
