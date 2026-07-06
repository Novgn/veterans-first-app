// CtaBand — the closing call to action on a dark navy surface.
//
// White text on navy, reversed Road Ahead mark, the design's closing copy
// ("Ready when you are. No rush, no app required."), and the dual CTA (Book a
// Ride + call). CTAs invert for the dark surface: a white-filled primary and a
// white-outline phone link, both >=60px. Reveals stagger on scroll.

import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '@/lib/site-config';

import { BrandLogo } from '@/components/shared/BrandLogo';

export function CtaBand() {
  return (
    <section className="bg-navy" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-3xl px-6 py-18 text-center md:py-20">
        <span data-reveal className="mb-7 inline-flex">
          <BrandLogo variant="reversed" size={52} />
        </span>
        <h2
          id="cta-heading"
          data-reveal
          className="text-pretty text-[40px] font-bold leading-[1.2] text-white"
        >
          Ready when you are. No rush, no app required.
        </h2>
        <p
          data-reveal
          style={{ animationDelay: '90ms' }}
          className="mx-auto mt-4.5 max-w-xl text-[20px] leading-relaxed text-white/85"
        >
          Book online in three taps, download the app, or pick up the phone and a real person will
          help you arrange everything.
        </p>
        <div
          data-reveal
          style={{ animationDelay: '180ms' }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#get-the-app"
            className="inline-flex min-h-[60px] items-center justify-center rounded-md bg-white px-7 text-title-3 font-semibold text-navy transition-colors hover:bg-stone"
          >
            Book a Ride
          </a>
          {SUPPORT_PHONE && SUPPORT_PHONE_TEL ? (
            <a
              href={SUPPORT_PHONE_TEL}
              className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-md border-2 border-white/40 px-7 text-title-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-brass)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              Call {SUPPORT_PHONE}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
