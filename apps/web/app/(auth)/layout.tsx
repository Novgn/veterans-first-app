import type { ReactNode } from 'react';

// Shared chrome for the Clerk auth pages (sign-in, sign-up): the widgets
// render into a bare route segment, so without this layout they sit at
// the viewport's top-left. Centers the card on desktop and mobile.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone px-4 py-12">
      {children}
    </main>
  );
}
