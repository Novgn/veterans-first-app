// MarketingNav — the public site header.
//
// Logo lockup · in-page section anchors · sage PhoneButton · primary
// "Book a Ride" CTA. Customer-facing only — no staff/console links live here.
// Semantic <header><nav>; the section links are real in-page anchors.

import Link from 'next/link';

import { BrandLogo } from './BrandLogo';
import { CtaLink } from './CtaLink';
import { PhoneButton } from './PhoneButton';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing & families', href: '#pricing' },
  { label: 'Get the app', href: '#get-the-app' },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-hairline bg-stone">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link href="/" aria-label="Veterans 1st Transportation home" className="rounded-md">
          <BrandLogo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md text-[17px] font-medium text-ink hover:text-navy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <PhoneButton label="Call us" phone="(919) 555-0100" className="hidden md:inline-flex" />
          <CtaLink href="#get-the-app" size="md">
            Book a Ride
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
