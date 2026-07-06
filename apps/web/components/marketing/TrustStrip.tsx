// TrustStrip — the navy four-up value band beneath the hero.
//
// Pre-launch, this band states operating *commitments* (policies we control),
// NOT measured performance statistics. Do not reintroduce ride counts,
// on-time percentages, or any figure presented as a track record until the
// business can substantiate it — fabricated stats are FTC Act §5 exposure.
// Every claim below must remain literally true at launch (confirm the WAV /
// wheelchair-accessible capability before go-live). The design's JS count-up is
// intentionally dropped (CSS-only motion mandate); the band scroll-reveals as a
// group. Items are a definition list for semantics; reduced-motion shows the
// end state.

const STATS = [
  { value: 'No surge', label: 'One upfront price, locked before you confirm' },
  { value: 'Door-to-door', label: 'A hand to and from the vehicle, every ride' },
  { value: 'For veterans', label: 'Built for veterans and people with disabilities' },
  { value: 'Accessible', label: 'Wheelchair-accessible rides available' },
];

export function TrustStrip() {
  return (
    <section className="bg-navy" aria-label="By the numbers">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            data-reveal
            style={{ animationDelay: `${i * 80}ms` }}
            className="border-b border-white/10 px-6 py-8 text-center lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block text-balance text-[26px] font-bold text-white sm:text-[30px]">
                {stat.value}
              </span>
              <span className="mt-1 block text-callout text-white/[0.78]">{stat.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
