import type { Metadata } from 'next';

import { MarketingHome } from '@/components/marketing/MarketingHome';

// Customer-facing metadata for the public landing page. Overrides the root
// layout's default ("Veterans 1st Console"), which is meant for the staff
// consoles, not the marketing site.
export const metadata: Metadata = {
  title: 'Veterans 1st Transportation — Reliable Rides for Veterans & People with Disabilities',
  description:
    'Relationship-centered medical transportation across the Triangle and beyond. Book a ride with caring, background-checked drivers who know you by name.',
};

// The public marketing site — customer-facing only. No auth and no staff
// routing live here, so the landing page renders statically. Staff reach the
// operations console by signing in (Clerk routes them by role via /console),
// never from a link on this page.
export default function Home() {
  return <MarketingHome />;
}
