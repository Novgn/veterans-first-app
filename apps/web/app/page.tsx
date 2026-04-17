import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserWithRole } from "@/lib/auth/current-user";

// Auth-dependent: must run at request time, not build time.
export const dynamic = "force-dynamic";

// Detect placeholder Clerk keys used in CI builds; without a real key the
// server-side currentUser lookup is unavailable, so render a static landing
// page rather than crashing.
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = clerkKey && clerkKey.length > 20 && !clerkKey.includes("placeholder");

export default async function Home() {
  if (hasValidClerkKey) {
    const user = await getCurrentUserWithRole();
    if (user) {
      switch (user.role) {
        case "dispatcher":
          redirect("/dispatch");
        case "admin":
          // Admins own both /admin and /business sections; land on /admin and
          // the section nav routes to /business when needed.
          redirect("/admin");
        default:
        // Riders, drivers, and family stay on the public landing — the mobile
        // app is their tool. (See app/page.tsx body.)
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-8 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Veterans 1st Console</h1>
      <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
        Operations portal for dispatchers, admins, and business staff. Riders, drivers, and family
        members should use the Veterans 1st mobile app.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
