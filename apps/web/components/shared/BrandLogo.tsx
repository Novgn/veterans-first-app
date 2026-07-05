// BrandLogo — the "Road Ahead" mark + Veterans 1st wordmark, lockup-style.
//
// Recreates the design's nav/footer logo: the Road Ahead mark (navy disc, white
// road, brass honor-star) beside the two-line wordmark. Two variants:
//   • default  — navy mark + navy "Veterans 1st" + sage "TRANSPORTATION"
//                (on the stone canvas / light surfaces).
//   • reversed — white mark + white "Veterans 1st" + muted-white sub-line
//                (on the navy footer / CTA surfaces).
//
// The mark is inline SVG (mirrors public/logo/road-ahead-mark.svg) so it can be
// tinted per-variant; brass remains NON-TEXT (the honor star only).

import { cn } from '@/lib/cn';

interface BrandLogoProps {
  variant?: 'default' | 'reversed';
  /** Mark size in px (square). Wordmark scales alongside it. */
  size?: number;
  className?: string;
  /**
   * Opt-in animated-collapse treatment for the console sidebar: the wordmark
   * gets `overflow-hidden` + a `max-width` clamp + opacity/translate
   * transitions so `markOnly` can fade/slide it out smoothly instead of
   * snapping. Defaults off — marketing usages (MarketingNav, CtaBand,
   * MarketingFooter) render the lockup at its natural, unclipped width
   * exactly as before the sidebar work.
   */
  collapsible?: boolean;
  /**
   * Collapse to the mark-only lockup (public/logo/road-ahead-mark*.svg
   * equivalent). Only meaningful with `collapsible` — without it the
   * wordmark has no collapse/transition styles to animate through.
   */
  markOnly?: boolean;
}

export function BrandLogo({
  variant = 'default',
  size = 46,
  className,
  collapsible = false,
  markOnly = false,
}: BrandLogoProps) {
  const reversed = variant === 'reversed';
  const disc = reversed ? '#FFFFFF' : 'var(--color-navy)';
  const road = reversed ? 'var(--color-navy)' : '#FFFFFF';
  const stroke = reversed ? '#FFFFFF' : 'var(--color-navy)';

  return (
    <span className={cn('inline-flex items-center', collapsible ? undefined : 'gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label="Veterans 1st Transportation, the Road Ahead mark"
        className="shrink-0"
      >
        <circle cx="32" cy="32" r="28" fill={disc} />
        <path d="M23 47 L41 47 L36.5 25 L27.5 25 Z" fill={road} />
        <path
          d="M32 44 L32 40 M32 36.5 L32 32.5 M32 29.5 L32 27"
          stroke={stroke}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Brass honor star — the one non-text accent. */}
        <path
          d="M32 11 l1.7 3.5 3.9 .4 -2.9 2.6 .8 3.8 -3.5-2 -3.5 2 .8-3.8 -2.9-2.6 3.9-.4 z"
          fill="var(--color-brass)"
        />
      </svg>
      <span
        aria-hidden={(collapsible && markOnly) || undefined}
        className={cn(
          'leading-[1.04]',
          // The clip/clamp treatment is console-sidebar-only; marketing
          // lockups keep their natural width (no overflow-hidden, no max-w).
          collapsible &&
            'overflow-hidden whitespace-nowrap transition-all duration-150 ease-in-out',
          collapsible &&
            (markOnly
              ? 'max-w-0 -translate-x-2 opacity-0'
              : 'ml-3 max-w-[180px] translate-x-0 opacity-100'),
        )}
      >
        <span
          className={cn(
            'block text-[20px] font-bold tracking-[-0.01em]',
            reversed ? 'text-white' : 'text-navy',
          )}
        >
          Veterans 1st
        </span>
        <span
          className={cn(
            'block text-[11px] font-semibold tracking-[0.14em]',
            reversed ? 'text-white/60' : 'text-sage',
          )}
        >
          TRANSPORTATION
        </span>
      </span>
    </span>
  );
}
