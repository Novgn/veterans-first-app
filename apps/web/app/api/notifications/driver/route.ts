// Driver-facing notifications endpoint (Story 4.8).
//
// Called by dispatch when a ride is offered, cancelled, or modified.
// Looks up the driver + ride context, builds a message, and dispatches
// through the shared notification pipeline.

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { buildDriverRideMessage } from '@veterans-first/shared';
import { getDb, rides, users } from '@veterans-first/shared/db';

import { getCurrentUserId } from '@/lib/auth/roles';
import { dispatchNotification } from '@/lib/notifications/dispatch';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type DriverEventType = 'driver_ride_assigned' | 'driver_ride_cancelled' | 'driver_ride_updated';

interface DriverNotificationRequest {
  type: DriverEventType;
  rideId: string;
  driverId: string;
  reason?: string;
  changedFields?: string[];
}

export async function POST(req: Request) {
  const caller = await getCurrentUserId();
  if (!caller) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: DriverNotificationRequest;
  try {
    body = (await req.json()) as DriverNotificationRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, rideId, driverId, reason, changedFields } = body;
  if (!type || !rideId || !driverId) {
    return NextResponse.json({ error: 'type, rideId, driverId are required' }, { status: 400 });
  }

  try {
    const db = getDb();

    const [ride] = await db
      .select({
        id: rides.id,
        riderId: rides.riderId,
        pickupAddress: rides.pickupAddress,
        scheduledPickupTime: rides.scheduledPickupTime,
      })
      .from(rides)
      .where(eq(rides.id, rideId))
      .limit(1);
    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    const [rider] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, ride.riderId))
      .limit(1);

    const [driver] = await db
      .select({ id: users.id, phone: users.phone })
      .from(users)
      .where(eq(users.id, driverId))
      .limit(1);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const message = buildDriverRideMessage(type, {
      riderName: rider ? `${rider.firstName} ${rider.lastName}`.trim() : null,
      pickupAddress: ride.pickupAddress,
      scheduledPickupTime: ride.scheduledPickupTime?.toISOString() ?? '',
      reason: reason ?? null,
      changedFields: changedFields ?? [],
    });

    const result = await dispatchNotification(
      {
        userId: driver.id,
        rideId,
        notificationType: type,
        title: message.title,
        body: message.body,
      },
      driver.phone,
    );

    return NextResponse.json({ success: true, type, rideId, dispatch: result });
  } catch (err) {
    log.error(
      {
        event: 'notifications.driver.error',
        rideId,
        err: err instanceof Error ? err.message : String(err),
      },
      'driver notification failed',
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
