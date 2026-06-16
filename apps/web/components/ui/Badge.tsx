// StatusBadge — Veteran Honor design system.
//
// A pill (rounded-full) status tag with a semantic background and bold/large
// white label. Per the DS, color is NEVER the sole signal — a badge always
// carries text. Variants map to the semantic palette: navy (primary/default),
// sage (secondary), success, warning, error. White-on-fill contrast for these
// fills meets at least WCAG AA for the bold caption text they carry.
//
// Shadcn-style: forwardRef, `cn()` merge, a className passthrough, and a tiny
// variant record (same pattern as Button.tsx). Brass is intentionally NOT a
// variant here — brass is non-text and never a fill behind text.

import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-navy text-white',
  secondary: 'bg-sage text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  error: 'bg-error text-white',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'default', ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-caption font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
