import { NextResponse } from 'next/server';

import { classifyCredential } from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { toCsv } from '@/lib/csv';
import { getServerSupabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    return new NextResponse('forbidden', { status: 403 });
  }

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('driver_credentials')
    .select(
      'id, driver_id, credential_type, credential_number, issued_date, expiration_date, verification_status, verified_at',
    )
    .order('driver_id');

  const rows =
    (data as Array<{
      id: string;
      driver_id: string;
      credential_type: string;
      credential_number: string | null;
      issued_date: string | null;
      expiration_date: string | null;
      verification_status: string;
      verified_at: string | null;
    }> | null) ?? [];

  const csv = toCsv([
    [
      'credential_id',
      'driver_id',
      'credential_type',
      'credential_number',
      'issued_date',
      'expiration_date',
      'verification_status',
      'classification',
      'verified_at',
    ],
    ...rows.map((r) => [
      r.id,
      r.driver_id,
      r.credential_type,
      r.credential_number ?? '',
      r.issued_date ?? '',
      r.expiration_date ?? '',
      r.verification_status,
      classifyCredential({
        expirationDate: r.expiration_date,
        verificationStatus: r.verification_status,
      }),
      r.verified_at ?? '',
    ]),
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="compliance-credentials.csv"',
    },
  });
}
