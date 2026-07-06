// AppDownload — the "Be first to ride" band (#get-the-app).
//
// The mobile app isn't in any app store yet, so this is an HONEST pre-launch
// section rather than a fake download band: an email launch-waitlist
// (WaitlistForm) on the left, an "app preview" device mock on the right, and
// non-interactive "Coming soon" store pills — no clickable store badges, no
// fake QR code. Keeps the #get-the-app anchor + #app-heading id so the five
// CTAs that scroll here still resolve.
//
// NOTE: the support phone comes from site-config (SUPPORT_PHONE), which reads
// NEXT_PUBLIC_SUPPORT_PHONE. When that env is unset there is no number (no
// placeholder), so the "call us" line falls back to a launch-phone message.
// Set the real dispatch line before launch.

import { cn } from '@/lib/cn';
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '@/lib/site-config';

import { WaitlistForm } from './WaitlistForm';

// NOTE: an earlier draft mocked this section up with a phone-frame "app
// preview" image slot. The only rider-app screens available at the time were
// low-resolution, multi-panel design-comp exports (each already baked its own
// phone bezel + neighboring screens into a single flat image), so there was
// no clean single-screen crop to drop into a second device frame without
// producing a blurry "phone inside a phone" result. Rather than ship that, we
// dropped the mock device and let the waitlist copy own the section — matches
// the honest, no-fake-affordances approach the rest of this component takes
// (see the file banner above). Swap back in a real device mock once actual
// app screenshots exist.
export function AppDownload() {
  return (
    <section
      id="get-the-app"
      className="scroll-mt-24 border-t border-border-hairline bg-white"
      aria-labelledby="app-heading"
    >
      <div
        data-reveal
        className="mx-auto flex max-w-2xl flex-col items-center px-6 py-18 text-center md:px-8 md:py-20"
      >
        <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sage">
          Coming soon
        </p>
        <h2
          id="app-heading"
          className="mt-3.5 text-pretty text-[38px] font-bold leading-[1.2] text-ink"
        >
          Be first to ride
        </h2>
        <p className="mt-4 max-w-[460px] text-[19px] leading-relaxed text-ink-secondary">
          The Veterans 1st app is on its way. Book in three taps, watch your driver arrive, and keep
          your saved places in one calm place. Leave your email and we&rsquo;ll tell you the day
          it&rsquo;s ready.
        </p>

        <div className="mt-7 w-full max-w-[420px] text-left">
          <WaitlistForm />
        </div>

        {SUPPORT_PHONE && SUPPORT_PHONE_TEL ? (
          <p className="mt-6 max-w-[460px] text-callout leading-relaxed text-ink-secondary">
            Don&rsquo;t want to wait? You don&rsquo;t need the app to ride. Call us at{' '}
            <a
              href={SUPPORT_PHONE_TEL}
              className="whitespace-nowrap font-semibold text-navy hover:text-navy-700"
            >
              {SUPPORT_PHONE}
            </a>{' '}
            and a real person will arrange everything.
          </p>
        ) : (
          <p className="mt-6 max-w-[460px] text-callout leading-relaxed text-ink-secondary">
            Don&rsquo;t want to wait? You won&rsquo;t need the app to ride — booking by phone opens
            at launch.
          </p>
        )}

        <ComingSoonBadges className="mt-7 justify-center" />
      </div>
    </section>
  );
}

// Honest, non-interactive "Coming soon" pills — deliberately NOT styled like
// clickable store buttons (stone fill + hairline border, ink glyph, no hover
// lift, role="img") so they can't be mistaken for live App Store / Play links.
function ComingSoonBadges({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <span
        role="img"
        aria-label="Coming soon to the Apple App Store"
        className="inline-flex min-h-[52px] items-center gap-3 rounded-xl border border-border-hairline bg-stone px-4 py-2.5"
      >
        <AppleGlyph />
        <span className="text-left leading-[1.1]">
          <span className="block text-[11px] uppercase tracking-[0.04em] text-ink-secondary">
            Coming soon to the
          </span>
          <span className="block text-[17px] font-semibold text-ink">App Store</span>
        </span>
      </span>
      <span
        role="img"
        aria-label="Coming soon to Google Play"
        className="inline-flex min-h-[52px] items-center gap-3 rounded-xl border border-border-hairline bg-stone px-4 py-2.5"
      >
        <PlayGlyph />
        <span className="text-left leading-[1.1]">
          <span className="block text-[11px] uppercase tracking-[0.04em] text-ink-secondary">
            Coming soon to
          </span>
          <span className="block text-[17px] font-semibold text-ink">Google Play</span>
        </span>
      </span>
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="var(--color-ink)" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.09-2.02-3.76-2.05-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.71-1.04-2.74-4.13zM14.69 4.93c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="var(--color-ink)" aria-hidden="true">
      <path
        d="M3.6 2.3c-.26.27-.4.7-.4 1.25v16.9c0 .55.14.98.4 1.25l.06.05L13.1 12.3v-.2L3.66 2.25l-.06.05z"
        opacity="0.85"
      />
      <path d="M16.3 15.5l-3.2-3.2v-.2l3.2-3.2.07.04 3.8 2.16c1.08.61 1.08 1.62 0 2.24l-3.8 2.16-.07.04z" />
      <path d="M16.37 15.46 13.1 12.1l-9.5 9.6c.36.38.94.42 1.6.05l11.17-6.29z" opacity="0.7" />
      <path d="M16.37 8.74 5.2 2.45c-.66-.37-1.24-.33-1.6.05l9.5 9.5 3.27-3.26z" opacity="0.5" />
    </svg>
  );
}
