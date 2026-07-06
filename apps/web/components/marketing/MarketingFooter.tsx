// MarketingFooter — navy footer with the reversed logo, blurb, link columns,
// the Veterans Crisis Line, a guarded call-us block, and a legal bottom bar.
//
// Customer-facing only — no staff/console links. In-page anchors reuse the
// section ids; legal links point at real routes (/privacy, /terms,
// /accessibility). The call-us block only renders when a support phone is
// configured (no fictional placeholder number ever ships).

import Link from 'next/link';

import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, VETERANS_CRISIS_LINE } from '@/lib/site-config';

import { BrandLogo } from '@/components/shared/BrandLogo';

const COLUMNS: { heading: string; links: { label: string; href: string; external?: boolean }[] }[] =
  [
    {
      heading: 'Company',
      links: [
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Our drivers', href: '#drivers' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'For families', href: '#for-families' },
        { label: 'Get the app', href: '#get-the-app' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Accessibility', href: '/accessibility' },
      ],
    },
  ];

export function MarketingFooter() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xs">
            <BrandLogo variant="reversed" size={42} />
            <p className="mt-4 text-callout leading-relaxed text-white/[0.72]">
              Relationship-centered medical transportation, serving communities across the Triangle
              and beyond.
            </p>
            <p className="mt-5 text-caption text-white/60">
              Mobile app coming soon for iPhone &amp; Android.
            </p>
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
                      className="flex min-h-[44px] items-center rounded-md text-callout text-white/85 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className="flex min-h-[44px] items-center rounded-md text-callout text-white/85 hover:text-white"
                    >
                      {link.label}
                    </a>
                  ),
                )}
              </nav>
            ))}

            {SUPPORT_PHONE && SUPPORT_PHONE_TEL ? (
              <div className="flex flex-col gap-2.5">
                <span className="text-caption font-semibold uppercase tracking-[0.05em] text-white/50">
                  Call us
                </span>
                <a
                  href={SUPPORT_PHONE_TEL}
                  className="rounded-md text-[22px] font-bold text-white hover:text-white/90"
                >
                  {SUPPORT_PHONE}
                </a>
                <span className="text-caption text-white/[0.72]">
                  Mon&ndash;Sat · we answer in person
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Veterans Crisis Line — official public contacts, no VA seal imagery. */}
        <aside
          aria-label="Veterans Crisis Line"
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/12 pt-6"
        >
          <span className="text-caption font-semibold uppercase tracking-[0.05em] text-white/50">
            Veterans Crisis Line
          </span>
          <span className="text-callout text-white/85">
            In crisis or having thoughts of suicide?{' '}
            <a href={VETERANS_CRISIS_LINE.callHref} className="font-semibold text-white underline">
              {VETERANS_CRISIS_LINE.callInstruction}
            </a>
            , text{' '}
            <a href={VETERANS_CRISIS_LINE.textHref} className="font-semibold text-white underline">
              {VETERANS_CRISIS_LINE.textNumber}
            </a>
            , or{' '}
            <a
              href={VETERANS_CRISIS_LINE.chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline"
            >
              chat online
            </a>
            . Free, confidential, 24/7.
          </span>
        </aside>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/12 pt-6 text-caption text-white/60">
          <span>© 2026 Veterans 1st Transportation. All rights reserved.</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="rounded hover:text-white/90">
              Privacy
            </Link>
            <Link href="/terms" className="rounded hover:text-white/90">
              Terms
            </Link>
            <Link href="/accessibility" className="rounded hover:text-white/90">
              Accessibility
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
