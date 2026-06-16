// ImageSlot — labeled photography placeholder.
//
// The design calls for real photos (driver helping a rider, a real driver
// beside their vehicle, app screenshots). Until those exist, every photo
// becomes a calm, labeled placeholder block in a warm DS surface — stone on
// light sections, navy-100 elsewhere — so the layout reads correctly and the
// intended subject is documented in place. Decorative, so aria-hidden with the
// label exposed as visible text.

import { cn } from '@/lib/cn';

interface ImageSlotProps {
  /** What photo belongs here (shown as the placeholder label). */
  label: string;
  surface?: 'stone' | 'navy-100';
  className?: string;
}

export function ImageSlot({ label, surface = 'stone', className }: ImageSlotProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'flex h-full w-full items-center justify-center p-6',
        surface === 'stone' ? 'bg-stone' : 'bg-navy-100',
        className,
      )}
    >
      <span className="flex items-center gap-2 text-center text-callout font-medium text-ink-secondary">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        {label}
      </span>
    </div>
  );
}
