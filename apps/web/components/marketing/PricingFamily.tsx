// PricingFamily — two side-by-side cards: honest pricing + peace of mind.
//
// Left (white card): one fair, locked price with a stone PriceLock badge and a
// short fare list — no surge, ever. Right (navy card): the family safe-arrival
// promise with a sample notification chip. Carries the #pricing and
// #for-families anchors used by the nav.

const FARE_LINES = [
  '$25 base + $2.50 per mile',
  '20 minutes of wait time included',
  'We bill Medicaid, VA, and most NEMT plans directly',
];

export function PricingFamily() {
  return (
    <section className="bg-stone" aria-label="Pricing and family peace of mind">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-18 md:px-8 md:py-20 lg:grid-cols-2">
        {/* Pricing */}
        <div
          id="pricing"
          data-reveal
          className="flex scroll-mt-24 flex-col rounded-lg border border-border-hairline bg-white p-10 shadow-card"
        >
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sage">
            Honest pricing
          </p>
          <h2 className="mt-3.5 text-[32px] font-bold leading-tight text-ink">
            One fair price, locked before you ride
          </h2>
          <p className="mt-3.5 text-[18px] leading-relaxed text-ink-secondary">
            You see the price before you confirm, and it never changes &mdash; no surge when it
            rains, no surprises at the curb.
          </p>

          <div className="mt-6 inline-flex w-fit items-center gap-3 rounded-md border border-success bg-stone px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block text-[20px] font-bold text-ink">$45 locked</span>
              <span className="block text-caption text-ink-secondary">No surge. Ever.</span>
            </span>
          </div>

          <ul className="mt-6 flex flex-col gap-3">
            {FARE_LINES.map((line) => (
              <li key={line} className="text-[17px] text-ink">
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* For families */}
        <div
          id="for-families"
          data-reveal
          className="flex scroll-mt-24 flex-col rounded-lg bg-navy p-10 shadow-card"
        >
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-white/70">
            For families
          </p>
          <h2 className="mt-3.5 text-[32px] font-bold leading-tight text-white">
            Peace of mind, from wherever you are
          </h2>
          <p className="mt-3.5 text-[18px] leading-relaxed text-white/85">
            Link your account to a parent&rsquo;s with their permission. Follow the ride, and get a
            photo the moment they&rsquo;re home safe.
          </p>

          <div className="mt-7 flex items-center gap-3.5 rounded-[14px] bg-white p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success text-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </span>
            <span>
              <span className="block text-[18px] font-bold text-ink">Mom arrived safely.</span>
              <span className="mt-0.5 block text-caption text-ink-secondary">
                At her front door · 9:06 AM
              </span>
            </span>
          </div>

          <div className="flex-1" />
          <p className="mt-6 text-caption leading-relaxed text-white/70">
            You&rsquo;ll never see medical details &mdash; only that they got where they were going,
            safely.
          </p>
        </div>
      </div>
    </section>
  );
}
