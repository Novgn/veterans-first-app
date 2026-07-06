// LegalScaffold — shared chrome + prose styling for the marketing legal pages
// (/privacy, /terms, /accessibility).
//
// Renders the marketing nav + footer around a readable prose column, with a
// prominent DRAFT banner. These pages are scaffolds pending legal review — the
// copy below each heading is a placeholder skeleton, NOT reviewed policy, and
// every page is marked `noindex` in its metadata until finalized. Company
// specifics are left as bracketed [PLACEHOLDER] tokens for counsel/ops to fill.

import type { ReactNode } from 'react';

import { MarketingFooter } from './MarketingFooter';
import { MarketingNav } from './MarketingNav';

interface LegalScaffoldProps {
  title: string;
  updated: string;
  /** When false, the DRAFT caution banner is hidden (e.g. once counsel signs off). */
  draft?: boolean;
  children: ReactNode;
}

export function LegalScaffold({ title, updated, draft = true, children }: LegalScaffoldProps) {
  return (
    <div className="min-h-screen bg-stone">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-navy focus-visible:px-4 focus-visible:py-2 focus-visible:text-body focus-visible:font-semibold focus-visible:text-white"
      >
        Skip to main content
      </a>
      <MarketingNav />
      <main id="main-content" tabIndex={-1}>
        <div className="mx-auto max-w-3xl px-6 py-14 md:px-8 md:py-20">
          {draft ? (
            <div
              role="note"
              className="mb-8 rounded-lg border-l-4 border-navy bg-white p-4 shadow-card"
            >
              <p className="text-body text-ink">
                <strong className="font-bold">Draft — pending legal review.</strong> This document
                is a working placeholder and is <strong>not yet in effect</strong>. It is not legal
                advice and does not create a binding agreement. Final, counsel-reviewed text will
                replace it before launch.
              </p>
            </div>
          ) : null}

          <h1 className="text-balance text-[36px] font-bold leading-tight text-ink">{title}</h1>
          <p className="mt-2 text-caption text-ink-secondary">{updated}</p>

          <div className="mt-8 flex flex-col gap-4 text-[17px] leading-relaxed text-ink-secondary [&_a]:font-medium [&_a]:text-navy [&_a]:underline [&_h2]:mt-6 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:text-ink [&_h3]:mt-3 [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-ink [&_li]:mt-1.5 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-6">
            {children}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
