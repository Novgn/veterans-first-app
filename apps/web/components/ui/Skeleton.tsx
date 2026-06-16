// Minimal shadcn-style Skeleton (Story 4.3).
//
// A neutral pulsing placeholder block. Domain-specific skeletons in
// `components/shared/` (SkeletonCard, SkeletonTable) compose this primitive
// to match real content layout.

import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

// Veteran Honor placeholder: a calm hairline-toned pulse on the stone canvas,
// rounded-md (12px) default. Reduced-motion users get a static block via the
// global prefers-reduced-motion rule in tokens.css.
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-border-hairline', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
