import { NextResponse } from 'next/server';

import {
  OPERATIONAL_WINDOW_OPTIONS,
  summarizeOperationalRides,
  windowToRange,
  type OperationalWindowOption,
  type RideForOperationalMetrics,
} from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { toCsv } from '@/lib/csv';
import { getServerSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    return new NextResponse('forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const windowParam = url.searchParams.get('window') ?? '7d';
  const window: OperationalWindowOption =
    OPERATIONAL_WINDOW_OPTIONS.find((o) => o.value === windowParam)?.value ?? '7d';

  const range = windowToRange(window);
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('rides')
    .select('id, status, scheduled_pickup_time, completed_at')
    .gte('scheduled_pickup_time', range.startIso)
    .lt('scheduled_pickup_time', range.endExclusiveIso);

  const rows =
    (data as Array<{
      id: string;
      status: string;
      scheduled_pickup_time: string | null;
      completed_at: string | null;
    }> | null) ?? [];
  const metricRides: RideForOperationalMetrics[] = rows.map((r) => ({
    id: r.id,
    status: r.status,
    scheduledPickupTime: r.scheduled_pickup_time,
    completedAt: r.completed_at,
  }));
  const summary = summarizeOperationalRides(metricRides);

  const csv = toCsv([
    ['date', 'total', 'completed', 'no_show', 'cancelled'],
    ...summary.perDay.map((r) => [r.date, r.total, r.completed, r.noShow, r.cancelled]),
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="operations-${window}.csv"`,
    },
  });
}
