// Ride notifications endpoint.
//
// Replaces the Deno edge function previously at
// supabase/functions/ride-notifications/. Triggered by Supabase database
// webhooks (or direct API calls from the dispatch console) when a ride
// state changes.
//
// Supported event types:
//   - ride_accepted: driver accepted a ride → notify rider
//   - ride_declined: driver declined (internal log only)
//   - offer_expired: ride offer timed out → mark offer expired and
//     return ride to dispatch pool
//
// TODO: wire actual push (Expo Push or FCM). The current implementation
// is a structured log + DB state-update placeholder, mirroring Story 3.3
// behavior.

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, rideOffers } from '@veterans-first/shared/db';

import { getCurrentUserId } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface NotificationRequest {
  type: 'ride_accepted' | 'ride_declined' | 'offer_expired';
  rideId: string;
  driverId?: string;
  riderId?: string;
}

export async function POST(req: Request) {
  // Auth: must be a signed-in caller (typically the dispatch console or a
  // Supabase database webhook with a service role bearer). Database
  // webhooks should be configured to send a Clerk-issued service token
  // — see operator runbook.
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: NotificationRequest;
  try {
    body = (await req.json()) as NotificationRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, rideId, driverId } = body;
  if (!type || !rideId) {
    return NextResponse.json({ error: 'type and rideId required' }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (type) {
      case 'ride_accepted': {
        // TODO: enqueue push notification to rider via Expo Push / FCM.
        console.log(`[ride-notifications] ride_accepted ride=${rideId}`);
        return NextResponse.json({ success: true, type, rideId });
      }

      case 'ride_declined': {
        console.log(
          `[ride-notifications] ride_declined ride=${rideId} driver=${driverId ?? 'unknown'}`,
        );
        return NextResponse.json({ success: true, type, rideId });
      }

      case 'offer_expired': {
        await db
          .update(rideOffers)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(rideOffers.rideId, rideId));
        console.log(`[ride-notifications] offer_expired ride=${rideId}`);
        return NextResponse.json({ success: true, type, rideId });
      }

      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[ride-notifications] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
