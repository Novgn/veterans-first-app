// Hero — the front door. Two-column: copy + photo slot.
//
// Staggered entrance via [data-enter] + `--enter-delay` (see globals.css). Eyebrow
// pill ("Serving the Triangle and beyond"), the brand headline, supporting copy,
// CTA row (Book a Ride + call), and a trust line (no surge, no account to call,
// 20 min wait included). Collapses to a single column below lg.

import type { CSSProperties } from 'react';

import Image from 'next/image';

import { SUPPORT_PHONE } from '@/lib/site-config';

import { CtaLink } from './CtaLink';
import { PhoneButton } from './PhoneButton';

function enterDelay(ms: number): CSSProperties {
  return { '--enter-delay': `${ms}ms` } as CSSProperties;
}

export function Hero() {
  return (
    <section className="bg-stone" aria-labelledby="hero-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:px-8 lg:grid-cols-2">
        <div>
          <span
            data-enter
            style={enterDelay(0)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-hairline bg-white px-3.5 py-1.5"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-sage)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-caption font-semibold text-ink">
              Serving the Triangle and beyond
            </span>
          </span>

          <h1
            id="hero-heading"
            data-enter
            style={enterDelay(90)}
            className="text-pretty text-[40px] font-bold leading-[1.12] tracking-[-0.01em] text-ink sm:text-[52px]"
          >
            It&rsquo;s not about the miles. It&rsquo;s about the service.
          </h1>

          <p
            data-enter
            style={enterDelay(180)}
            className="mt-6 max-w-[480px] text-[21px] leading-relaxed text-ink-secondary"
          >
            Safe, dignified rides to the doctor, the pharmacy, and the grocery store, for seniors,
            veterans, and anyone who needs a hand getting there.
          </p>

          <div
            data-enter
            style={enterDelay(270)}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <CtaLink href="#get-the-app" size="lg">
              Book a Ride
            </CtaLink>
            <PhoneButton label={`Or call ${SUPPORT_PHONE}`} phone={SUPPORT_PHONE} />
          </div>

          <p
            data-enter
            style={enterDelay(360)}
            className="mt-7 flex items-center gap-2.5 text-callout text-ink-secondary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M21.801 10A10 10 0 1 1 17 3.335" />
              <path d="m9 11 3 3L22 4" />
            </svg>
            No surge pricing · no account required to call · 20 min wait included
          </p>
        </div>

        <div
          data-enter
          style={enterDelay(160)}
          className="relative h-[360px] overflow-hidden rounded-[20px] border border-border-hairline shadow-raised sm:h-[460px]"
        >
          <Image
            src="/marketing/hero-driver-rider.png"
            alt="A Veterans 1st driver holds the car door for a senior veteran rider at golden hour"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
