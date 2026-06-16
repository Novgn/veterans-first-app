// Minimal shadcn-style Button (Story 4.3) — restyled to the "Veteran Honor" DS.
//
// Ships inline rather than via `npx shadcn add button` so the first scaffold
// works offline. Extend with `cva` (class-variance-authority) when you need
// more variants; this version keeps the dependency footprint tiny.
//
// Veteran Honor variants: primary = filled navy + white (the one action color),
// outline = navy border/text, ghost = navy text. `destructive` filled error.
// The global 4px navy focus ring (tokens.css) covers focus-visible; we keep a
// transition + disabled treatment here. Radius is rounded-md (12px) per DS.

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-navy text-white hover:bg-navy-700',
  outline: 'border-2 border-navy bg-transparent text-navy hover:bg-navy-100',
  ghost: 'bg-transparent text-navy hover:bg-navy-100',
  destructive: 'bg-error text-white hover:bg-error/90',
};

// 56px (h-14) is the DS primary-CTA height; sm/md stay denser for console use.
const sizeClasses: Record<Size, string> = {
  sm: 'h-10 px-4 text-callout',
  md: 'h-12 px-5 text-body',
  lg: 'h-14 px-6 text-title-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
