'use client';

// MarketingNav — the public site header.
//
// Desktop (lg+): logo lockup · in-page section anchors · sage PhoneButton ·
// primary "Book a Ride" CTA. Mobile: logo + a hamburger that opens a panel
// with the same links, phone, and CTA (the desktop row would otherwise wrap
// off the bar). Customer-facing only — no staff/console links live here.
// Semantic <header><nav>; the section links are real in-page anchors.

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BrandLogo } from './BrandLogo';
import { CtaLink } from './CtaLink';
import { PhoneButton } from './PhoneButton';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing & families', href: '#pricing' },
  { label: 'Get the app', href: '#get-the-app' },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  // Close the menu on Escape, and when the viewport grows to the desktop nav.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onChange);
    return () => {
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onChange);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-hairline bg-stone">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link href="/" aria-label="Veterans 1st Transportation home" className="rounded-md">
          <BrandLogo />
        </Link>

        {/* Desktop section links */}
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

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <PhoneButton label="Call us" phone="(919) 555-0100" />
          <CtaLink href="#get-the-app" size="md">
            Book a Ride
          </CtaLink>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-strong text-ink hover:text-navy lg:hidden"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className="border-t border-border-hairline bg-stone px-6 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[52px] items-center rounded-md text-[18px] font-medium text-ink hover:text-navy"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-col gap-3 border-t border-border-hairline pt-5">
            <PhoneButton label="Call (919) 555-0100" phone="(919) 555-0100" className="w-full" />
            <CtaLink
              href="#get-the-app"
              size="md"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Book a Ride
            </CtaLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
