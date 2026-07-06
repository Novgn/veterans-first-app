// PhoneButton — the human-escalation guarantee (DESIGN.md § PhoneButton).
//
// Sage fill, white text, rounded-md, >=56px tall. A real `tel:` link so the
// phone number is always one tap away — never hidden as a fallback. Brass is
// reserved as the phone icon tint accent (non-text). The `label` carries the
// human-readable copy; `phone` is dialed.

import { cn } from '@/lib/cn';

interface PhoneButtonProps {
  label: string;
  // `null` when the support line is unconfigured — the button renders nothing
  // rather than dial a missing/placeholder number.
  phone: string | null;
  className?: string;
}

export function PhoneButton({ label, phone, className }: PhoneButtonProps) {
  if (!phone) return null;
  const tel = `tel:${phone.replace(/[^\d+]/g, '')}`;
  return (
    <a
      href={tel}
      className={cn(
        'inline-flex min-h-[56px] items-center justify-center gap-2 rounded-md bg-sage px-5 text-title-3 font-semibold text-white transition-colors hover:bg-sage-700',
        className,
      )}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-brass)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
      </svg>
      {label}
    </a>
  );
}
