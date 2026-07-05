import type { ReactNode } from 'react';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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

// Veteran Honor KPI card (dashboard-shell pivot, per Squarespace-admin/Whop
// reference): small-caps muted label, large bold value, hint/delta line
// below, and a "View all" + chevron affordance when `href` is set — the
// whole tile stays clickable (hover lifts the border to border-strong,
// matching the dispatch StatCard pattern). `badge` renders next to the
// title for alert-style tiles. Tokens only — no new colors.
export function DashboardCard({ title, value, hint, href, badge }: DashboardCardProps) {
  const card = (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border border-border-hairline bg-card p-6 shadow-card',
        href && 'transition-colors hover:border-border-strong',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
          {title}
        </div>
        {badge}
      </div>
      <div className="mt-2 text-display font-bold text-ink">{value}</div>
      {hint ? <div className="mt-1 text-caption text-ink-secondary">{hint}</div> : null}
      {href ? (
        <div className="mt-3 flex items-center gap-1 text-caption font-semibold text-navy">
          View all
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-lg outline-offset-2">
        {card}
      </Link>
    );
  }

  return card;
}
