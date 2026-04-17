import { NextResponse } from 'next/server';

import { HIPAA_ACCESS_ACTIONS } from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { parseComplianceRange } from '@/lib/compliance/dateRange';
import { toCsv } from '@/lib/csv';
import { getServerSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    return new NextResponse('forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const range = parseComplianceRange(url.searchParams.get('start'), url.searchParams.get('end'));

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('audit_logs')
    .select('id, user_id, action, resource_type, resource_id, created_at')
    .in('action', HIPAA_ACCESS_ACTIONS as readonly string[])
    .gte('created_at', range.startIso)
    .lt('created_at', range.endExclusiveIso)
    .order('created_at', { ascending: false })
    .limit(10_000);

  const rows =
    (data as Array<{
      id: string;
      user_id: string | null;
      action: string;
      resource_type: string;
      resource_id: string | null;
      created_at: string;
    }> | null) ?? [];

  const csv = toCsv([
    ['audit_id', 'user_id', 'action', 'resource_type', 'resource_id', 'created_at'],
    ...rows.map((r) => [
      r.id,
      r.user_id ?? '',
      r.action,
      r.resource_type,
      r.resource_id ?? '',
      r.created_at,
    ]),
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="compliance-hipaa-${range.startLabel}_${range.endLabel}.csv"`,
    },
  });
}
