// AppDownload — the "Get the app" band ("Take Veterans 1st with you").
//
// Left: copy + store-badge placeholders + a QR placeholder. Right: a phone
// device mock framing an app-screenshot image slot. Carries the #get-the-app
// anchor. Store badges and QR are placeholders (no real listings yet).

import { ImageSlot } from './ImageSlot';
import { StoreBadges } from './StoreBadges';

export function AppDownload() {
  return (
    <section
      id="get-the-app"
      className="scroll-mt-24 border-t border-border-hairline bg-white"
      aria-labelledby="app-heading"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-18 md:px-8 md:py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div data-reveal>
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sage">
            The app
          </p>
          <h2
            id="app-heading"
            className="mt-3.5 text-pretty text-[38px] font-bold leading-[1.2] text-ink"
          >
            Take Veterans 1st with you
          </h2>
          <p className="mt-4 max-w-[460px] text-[19px] leading-relaxed text-ink-secondary">
            Book in three taps, watch your driver arrive, and keep your saved places and preferences
            in one calm, easy place. Free to download &mdash; and a real person is still one tap
            away.
          </p>

          <StoreBadges className="mt-8" />

          <div className="mt-7 flex items-center gap-4.5">
            <div className="flex h-27 w-27 shrink-0 items-center justify-center rounded-[14px] border border-border-hairline bg-white shadow-card">
              <QrPlaceholder />
            </div>
            <p className="max-w-[200px] text-callout leading-relaxed text-ink-secondary">
              Point your phone&rsquo;s camera here to download.
            </p>
          </div>
        </div>

        <div data-reveal className="flex justify-center">
          <div className="relative h-[556px] w-[272px] rounded-[44px] bg-[#0E0D0B] p-2.5 shadow-[0_30px_56px_-20px_rgba(26,24,19,0.5)]">
            <div className="absolute left-1/2 top-4 z-10 h-6 w-23 -translate-x-1/2 rounded-2xl bg-[#0E0D0B]" />
            <div className="h-full w-full overflow-hidden rounded-[36px] bg-stone">
              <ImageSlot label="App screenshot — Rider home" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Decorative QR placeholder (not a scannable code yet).
function QrPlaceholder() {
  return (
    <svg
      width="78"
      height="78"
      viewBox="0 0 78 78"
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code placeholder"
    >
      <rect width="78" height="78" fill="#fff" />
      <g fill="var(--color-ink)">
        <rect x="6" y="6" width="18" height="18" />
        <rect x="10" y="10" width="10" height="10" fill="#fff" />
        <rect x="13" y="13" width="4" height="4" />
        <rect x="54" y="6" width="18" height="18" />
        <rect x="58" y="10" width="10" height="10" fill="#fff" />
        <rect x="61" y="13" width="4" height="4" />
        <rect x="6" y="54" width="18" height="18" />
        <rect x="10" y="58" width="10" height="10" fill="#fff" />
        <rect x="13" y="61" width="4" height="4" />
        <rect x="30" y="6" width="4" height="4" />
        <rect x="38" y="6" width="4" height="8" />
        <rect x="30" y="14" width="8" height="4" />
        <rect x="44" y="6" width="4" height="4" />
        <rect x="30" y="24" width="4" height="4" />
        <rect x="40" y="22" width="6" height="6" />
        <rect x="6" y="30" width="8" height="4" />
        <rect x="20" y="30" width="6" height="4" />
        <rect x="30" y="32" width="6" height="6" />
        <rect x="44" y="30" width="4" height="6" />
        <rect x="54" y="30" width="6" height="4" />
        <rect x="66" y="30" width="6" height="6" />
        <rect x="54" y="40" width="6" height="6" />
        <rect x="64" y="42" width="6" height="4" />
        <rect x="30" y="44" width="4" height="6" />
        <rect x="40" y="44" width="8" height="4" />
        <rect x="30" y="54" width="6" height="4" />
        <rect x="42" y="52" width="6" height="6" />
        <rect x="54" y="54" width="4" height="8" />
        <rect x="64" y="54" width="8" height="4" />
        <rect x="38" y="62" width="6" height="6" />
        <rect x="54" y="66" width="6" height="6" />
        <rect x="66" y="64" width="6" height="8" />
      </g>
    </svg>
  );
}
