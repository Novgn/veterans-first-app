// Minimal shadcn-style Card (Story 4.3).
//
// Exports the Card + CardHeader + CardTitle + CardContent sub-components as
// separate primitives so consumers can compose them directly. Each one is a
// thin wrapper over a semantic HTML element with Tailwind classes.

import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

// Veteran Honor card: white surface on the stone canvas, rounded-lg (16px),
// soft tonal-lift shadow (shadow-card), hairline border (dividers/decoration
// only — never a control boundary), generous 24px (p-6) interior padding.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border-hairline bg-card text-ink shadow-card',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-title-3 font-semibold text-ink', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}
