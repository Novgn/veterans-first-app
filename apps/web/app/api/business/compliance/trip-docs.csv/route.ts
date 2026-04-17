import { NextResponse } from 'next/server';

import { classifyTripDocumentation } from '@veterans-first/shared/utils';

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
  const ridesRes = await supabase
    .from('rides')
    .select(
      'id, pickup_address, dropoff_address, scheduled_pickup_time, completed_at, driver_id, fare_cents',
    )
    .eq('status', 'completed')
    .gte('completed_at', range.startIso)
    .lt('completed_at', range.endExclusiveIso);

  const rides =
    (ridesRes.data as Array<{
      id: string;
      pickup_address: string;
      dropoff_address: string;
      scheduled_pickup_time: string | null;
      completed_at: string | null;
      driver_id: string | null;
      fare_cents: number | null;
    }> | null) ?? [];

  if (rides.length === 0) {
    const csv = toCsv([
      [
        'ride_id',
        'pickup_time',
        'dropoff_time',
        'pickup_address',
        'dropoff_address',
        'driver_id',
        'fare_cents',
        'photo_url',
        'complete',
        'missing_fields',
      ],
    ]);
    return csvResponse(csv);
  }

  const ids = rides.map((r) => r.id);
  const eventsRes = await supabase
    .from('ride_events')
    .select('ride_id, event_type, photo_url')
    .in('ride_id', ids);
  const events =
    (eventsRes.data as Array<{
      ride_id: string;
      event_type: string;
      photo_url: string | null;
    }> | null) ?? [];
  const photoByRide = new Map<string, string>();
  for (const e of events) {
    if (e.event_type === 'arrived' && e.photo_url) photoByRide.set(e.ride_id, e.photo_url);
  }

  const rows = rides.map((ride) => {
    const photoUrl = photoByRide.get(ride.id) ?? null;
    const classification = classifyTripDocumentation({
      pickupTime: ride.scheduled_pickup_time,
      dropoffTime: ride.completed_at,
      pickupAddress: ride.pickup_address,
      dropoffAddress: ride.dropoff_address,
      driverId: ride.driver_id,
      mileageKm: null,
      photoUrl,
    });
    return [
      ride.id,
      ride.scheduled_pickup_time ?? '',
      ride.completed_at ?? '',
      ride.pickup_address,
      ride.dropoff_address,
      ride.driver_id ?? '',
      ride.fare_cents ?? '',
      photoUrl ?? 'NO_PHOTO',
      classification.complete ? 'complete' : 'incomplete',
      classification.missingFields.join('|'),
    ];
  });

  const csv = toCsv([
    [
      'ride_id',
      'pickup_time',
      'dropoff_time',
      'pickup_address',
      'dropoff_address',
      'driver_id',
      'fare_cents',
      'photo_url',
      'complete',
      'missing_fields',
    ],
    ...rows,
  ]);

  return csvResponse(csv);
}

function csvResponse(csv: string): NextResponse {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="compliance-trip-docs.csv"',
    },
  });
}
