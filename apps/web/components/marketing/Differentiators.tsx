// Differentiators — the relationship / "same friendly faces" trust section.
//
// Photo slot + copy with three checkmarked trust points. White surface bounded
// by hairline rules. Per the design we say "many of our drivers are veterans
// themselves" — we do NOT claim "veteran-owned". Sage check chips (sage-100
// fill, sage glyph).

import Image from 'next/image';

const POINTS = [
  'Background-checked, credentialed, and insured',
  'Trained to assist with walkers, wheelchairs, and service animals',
  'A real photo and name before every ride',
];

export function Differentiators() {
  return (
    <section className="border-y border-border-hairline bg-white" aria-labelledby="drivers-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-18 md:px-8 md:py-20 lg:grid-cols-2">
        <div
          data-reveal
          className="relative order-2 h-[340px] overflow-hidden rounded-[20px] border border-border-hairline shadow-card sm:h-[420px] lg:order-1"
        >
          <Image
            src="/marketing/driver-vehicle.png"
            alt="A friendly Veterans 1st driver standing beside their clean vehicle"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div data-reveal className="order-1 lg:order-2">
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sage">
            The same friendly faces
          </p>
          <h2 id="drivers-heading" className="mt-3.5 text-[36px] font-bold leading-[1.22] text-ink">
            Your driver Dave, who&rsquo;s driven you 23 times
          </h2>
          <p className="mt-4.5 max-w-[480px] text-[19px] leading-relaxed text-ink-secondary">
            We don&rsquo;t assign random drivers. You build a relationship with people who learn
            your name, your route, and how you like your ride. Many of our drivers are veterans
            themselves.
          </p>

          <ul className="mt-7 flex flex-col gap-3.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-[18px] text-ink">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
