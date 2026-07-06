// MarketingHome — the public marketing landing composition.
//
// Renders the full Veterans 1st marketing site in the design's section order:
// nav · hero · trust strip · how it works · drivers/differentiators ·
// pricing + family · get the app · CTA band · footer. Wired into app/page.tsx
// as the non-logged-in fallback (auth-aware routing is preserved upstream).
//
// Semantic landmarks: <MarketingNav> is the <header>, the sections live in
// <main>, and <MarketingFooter> is the <footer>.

import { AppDownload } from './AppDownload';
import { CtaBand } from './CtaBand';
import { Differentiators } from './Differentiators';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { MarketingFooter } from './MarketingFooter';
import { MarketingNav } from './MarketingNav';
import { PricingFamily } from './PricingFamily';
import { ScrollReveal } from './ScrollReveal';
import { TrustStrip } from './TrustStrip';

export function MarketingHome() {
  return (
    <div className="min-h-screen bg-stone">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-navy focus-visible:px-4 focus-visible:py-2 focus-visible:text-body focus-visible:font-semibold focus-visible:text-white"
      >
        Skip to main content
      </a>
      <ScrollReveal />
      <MarketingNav />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Differentiators />
        <PricingFamily />
        <AppDownload />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
