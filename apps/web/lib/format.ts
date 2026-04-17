import 'server-only';

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatMoneyCents(cents: number | null | undefined): string {
  const n = typeof cents === 'number' ? cents : 0;
  return `$${(n / 100).toFixed(2)}`;
}

export function humanStatus(status: string): string {
  return status
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}
