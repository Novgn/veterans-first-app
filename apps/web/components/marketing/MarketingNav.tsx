// MarketingNav — the public site header.
//
// Logo lockup · in-page section anchors · low-key "Staff sign in" link (keeps
// the operations console reachable) · sage PhoneButton · primary "Book a Ride"
// CTA. Semantic <header><nav>; the section links are real in-page anchors.

import Link from 'next/link';

import { BrandLogo } from './BrandLogo';
import { CtaLink } from './CtaLink';
import { PhoneButton } from './PhoneButton';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'For families', href: '#for-families' },
  { label: 'Get the app', href: '#get-the-app' },
];

export function MarketingNav() {
  return (
    <header className="border-b border-border-hairline bg-stone">
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
          <Link
            href="/sign-in"
            className="hidden rounded-md px-2 py-1 text-callout font-medium text-ink-secondary hover:text-navy sm:inline-flex"
          >
            Staff sign in
          </Link>
          <PhoneButton label="Call us" phone="(919) 555-0100" className="hidden md:inline-flex" />
          <CtaLink href="#get-the-app" size="md">
            Book a Ride
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
