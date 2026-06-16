// TrustStrip — the navy four-up stat band beneath the hero.
//
// Rides completed · on-time pickups · locked price (no surge) · WAV fleet. The
// design's JS count-up is intentionally dropped (CSS-only motion mandate) — the
// numbers render final and the band scroll-reveals as a group. Stats are a
// definition list for semantics; reduced-motion shows the end state.

const STATS = [
  { value: '12,000+', label: 'Rides completed' },
  { value: '96%', label: 'On-time pickups' },
  { value: '$45', label: 'Locked. No surge. Ever.' },
  { value: 'WAV', label: 'Wheelchair-accessible fleet' },
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
              <span className="block text-[34px] font-bold text-white">{stat.value}</span>
              <span className="mt-1 block text-callout text-white/[0.78]">{stat.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
