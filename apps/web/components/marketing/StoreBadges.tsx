// StoreBadges — App Store / Google Play download badge PLACEHOLDERS.
//
// No real store listings yet, so these are styled, accessible stand-ins (ink
// fill, white text, the platform glyph) rather than official badge artwork.
// `compact` renders the smaller footer variant.

import { cn } from '@/lib/cn';

const APPLE_PATH =
  'M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.09-2.02-3.76-2.05-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.71-1.04-2.74-4.13zM14.69 4.93c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z';

function AppleGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d={APPLE_PATH} />
    </svg>
  );
}

function PlayGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
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

interface StoreBadgesProps {
  compact?: boolean;
  className?: string;
}

export function StoreBadges({ compact = false, className }: StoreBadgesProps) {
  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2.5', className)}>
        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3.5 py-2">
          <AppleGlyph size={20} />
          <span className="text-caption font-semibold text-white">App Store</span>
        </span>
        <span className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-white/20 bg-white/10 px-3.5 py-2">
          <PlayGlyph size={19} />
          <span className="text-caption font-semibold text-white">Google Play</span>
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3.5', className)}>
      <span className="inline-flex min-h-[56px] cursor-default items-center gap-3 rounded-xl bg-ink px-5 py-3 transition-transform hover:-translate-y-0.5">
        <AppleGlyph size={26} />
        <span className="text-left leading-[1.05]">
          <span className="block text-[12px] text-white/75">Download on the</span>
          <span className="block text-[19px] font-semibold text-white">App Store</span>
        </span>
      </span>
      <span className="inline-flex min-h-[56px] cursor-default items-center gap-3 rounded-xl bg-ink px-5 py-3 transition-transform hover:-translate-y-0.5">
        <PlayGlyph size={24} />
        <span className="text-left leading-[1.05]">
          <span className="block text-[12px] text-white/75">Get it on</span>
          <span className="block text-[19px] font-semibold text-white">Google Play</span>
        </span>
      </span>
    </div>
  );
}
