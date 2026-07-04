import type { ReactNode } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/cn';

export interface DashboardCardProps {
  title: string;
  value: ReactNode;
  hint?: string;
  /** When set, the whole tile becomes a link to its detail page. */
  href?: string;
  /** Optional status badge rendered next to the title (e.g. credential alerts). */
  badge?: ReactNode;
}

// Veteran Honor metric card: white surface, rounded-lg, soft shadow-card,
// hairline border, p-6 padding. Label in ink-secondary caption; value bold ink.
// `href` wraps the tile in a Link (hover lifts the border to border-strong,
// matching the dispatch StatCard pattern) so KPI tiles can route to their
// detail page. `badge` renders next to the title for alert-style tiles.
export function DashboardCard({ title, value, hint, href, badge }: DashboardCardProps) {
  const card = (
    <div
      className={cn(
        'rounded-lg border border-border-hairline bg-card p-6 shadow-card',
        href && 'transition-colors hover:border-border-strong',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
          {title}
        </div>
        {badge}
      </div>
      <div className="mt-2 text-title-1 font-bold text-ink">{value}</div>
      {hint ? <div className="mt-1 text-caption text-ink-secondary">{hint}</div> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-lg outline-offset-2">
        {card}
      </Link>
    );
  }

  return card;
}
