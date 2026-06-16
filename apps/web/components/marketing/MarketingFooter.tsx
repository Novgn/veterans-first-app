// MarketingFooter — navy footer with the reversed logo, blurb, store-badge
// placeholders, link columns, and the call-us block.
//
// The "Staff sign in" link lives here too (Support column) so the operations
// console stays reachable from the footer as well as the nav. In-page anchors
// reuse the section ids; informational links are placeholders (no routes yet).

import Link from 'next/link';

import { BrandLogo } from './BrandLogo';
import { StoreBadges } from './StoreBadges';

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Company',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Our drivers', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact us', href: 'tel:+19195550100' },
      { label: 'For families', href: '#for-families' },
      { label: 'Staff sign in', href: '/sign-in' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-6 py-12 md:px-8">
        <div className="max-w-xs">
          <BrandLogo variant="reversed" size={42} />
          <p className="mt-4 text-callout leading-relaxed text-white/[0.72]">
            Relationship-centered medical transportation, serving communities across the Triangle
            and beyond.
          </p>
          <StoreBadges compact className="mt-5" />
        </div>

        <div className="flex flex-wrap gap-x-14 gap-y-8">
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-2.5">
              <span className="text-caption font-semibold uppercase tracking-[0.05em] text-white/50">
                {col.heading}
              </span>
              {col.links.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-md text-callout text-white/85 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="rounded-md text-callout text-white/85 hover:text-white"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </nav>
          ))}

          <div className="flex flex-col gap-2.5">
            <span className="text-caption font-semibold uppercase tracking-[0.05em] text-white/50">
              Call us
            </span>
            <a
              href="tel:+19195550100"
              className="rounded-md text-[22px] font-bold text-white hover:text-white/90"
            >
              (919) 555-0100
            </a>
            <span className="text-caption text-white/[0.72]">
              Mon&ndash;Sat · we answer in person
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
