import { MarketingHome } from '@/components/marketing/MarketingHome';

// The public marketing site — customer-facing only. No auth and no staff
// routing live here, so the landing page renders statically. Staff reach the
// operations console by signing in (Clerk routes them by role via /console),
// never from a link on this page.
export default function Home() {
  return <MarketingHome />;
}
