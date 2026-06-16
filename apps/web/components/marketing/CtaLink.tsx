// CtaLink — an anchor styled like the DS Button.
//
// The marketing CTAs ("Book a Ride") are navigation, so they must render as
// real <a> elements, not <button>. Rather than add an `asChild` slot to the
// shared Button, this mirrors its Veteran Honor classes (navy primary / navy
// outline) for the link case. Sizes match the DS CTA heights (lg = 56px+).

import type { AnchorHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline';
type Size = 'md' | 'lg';

interface CtaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-700',
  outline: 'border-2 border-navy bg-transparent text-navy hover:bg-navy-100',
};

const sizeClasses: Record<Size, string> = {
  md: 'min-h-[52px] px-5 text-body',
  lg: 'min-h-[60px] px-7 text-title-3',
};

export function CtaLink({
  variant = 'primary',
  size = 'lg',
  className,
  children,
  ...props
}: CtaLinkProps) {
  return (
    <a
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
