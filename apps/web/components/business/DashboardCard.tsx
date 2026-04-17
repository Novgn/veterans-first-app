import type { ReactNode } from 'react';

export interface DashboardCardProps {
  title: string;
  value: ReactNode;
  hint?: string;
}

export function DashboardCard({ title, value, hint }: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}
