import type { ReactNode } from 'react';

export interface DashboardCardProps {
  title: string;
  value: ReactNode;
  hint?: string;
}

// Veteran Honor metric card: white surface, rounded-lg, soft shadow-card,
// hairline border, p-6 padding. Label in ink-secondary caption; value bold ink.
export function DashboardCard({ title, value, hint }: DashboardCardProps) {
  return (
    <div className="rounded-lg border border-border-hairline bg-card p-6 shadow-card">
      <div className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
        {title}
      </div>
      <div className="mt-2 text-title-1 font-bold text-ink">{value}</div>
      {hint ? <div className="mt-1 text-caption text-ink-secondary">{hint}</div> : null}
    </div>
  );
}
