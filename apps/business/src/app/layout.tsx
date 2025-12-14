import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Veterans First Business",
  description: "Business operations portal for Veterans First transportation service",
};

// Check if Clerk key is valid (not a placeholder for CI builds)
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = clerkKey && clerkKey.length > 20 && !clerkKey.includes("placeholder");

function AuthHeader() {
  if (!hasValidClerkKey) {
    return <div className="text-gray-500 text-sm">Auth disabled</div>;
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
        <header className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Veterans First Business</div>
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
  // Skip ClerkProvider if no valid key (CI builds)
  if (!hasValidClerkKey) {
    return <LayoutContent>{children}</LayoutContent>;
  }

  return (
    <ClerkProvider>
      <LayoutContent>{children}</LayoutContent>
    </ClerkProvider>
  );
}
