import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veterans 1st Console",
  description: "Web console for Veterans 1st transportation service (dispatch, admin, business)",
};

// Detect placeholder Clerk keys used in CI builds so the build still works
// when the secret isn't injected. Production deploys MUST provide a real key.
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = clerkKey && clerkKey.length > 20 && !clerkKey.includes("placeholder");

function AuthHeader() {
  if (!hasValidClerkKey) {
    return <div className="text-sm text-gray-500">Auth disabled</div>;
  }
  return (
    <>
      <SignedOut>
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="flex items-center justify-between border-b p-4">
          <Link href="/" className="font-semibold">
            Veterans 1st Console
          </Link>
          <div>
            <AuthHeader />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!hasValidClerkKey) {
    return <LayoutContent>{children}</LayoutContent>;
  }

  return (
    <ClerkProvider>
      <LayoutContent>{children}</LayoutContent>
    </ClerkProvider>
  );
}
