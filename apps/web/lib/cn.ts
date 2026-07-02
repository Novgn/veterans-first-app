// `cn()` — the canonical shadcn/ui utility for merging class names.
//
// `clsx` handles conditional class composition (falsy values are dropped,
// arrays/objects are flattened). `tailwind-merge` then resolves Tailwind
// class *collisions* (e.g. `px-2` vs `px-4` — only the later one wins).
//
// Without tailwind-merge, you would end up with both classes in the DOM and
// rely on source order for precedence, which is brittle when composing
// variants. With it, the rightmost class always wins for any given utility
// bucket.
//
// The design system registers custom font-size utilities (text-body,
// text-title-1, …) via `--text-*` tokens in tokens.css. tailwind-merge's stock
// config doesn't know these are font sizes, so it mis-buckets e.g. `text-body`
// as a *text color* and drops a real `text-white`/`text-navy` that precedes it
// in the same cn() call — silently leaving elements with the wrong text color
// (this is why the navy "Book a Ride" CTA rendered with dark ink text). We
// teach twMerge the custom font-size names so size and color stay in separate
// buckets and never clobber each other.

import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'title-1',
            'title-2',
            'title-3',
            'headline',
            'body',
            'callout',
            'caption',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
