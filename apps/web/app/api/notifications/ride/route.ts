// Ride notifications endpoint.
//
// Handles rider-facing notifications driven by ride state changes:
//   - ride_accepted / ride_declined (legacy, Story 3.3)
//   - offer_expired (legacy, Story 3.3)
//   - driver_assigned / driver_en_route / driver_arrived (Story 4.7)
//
// All driver-status events dispatch through `dispatchNotification` so
// preference gates + notification_logs are honored.

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, rideOffers, rides, users } from '@veterans-first/shared/db';
import { buildDriverStatusMessage } from '@veterans-first/shared';

import { getCurrentUserId } from '@/lib/auth/roles';
import { dispatchNotification } from '@/lib/notifications/dispatch';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type EventType =
  | 'ride_accepted'
  | 'ride_declined'
  | 'offer_expired'
  | 'driver_assigned'
  | 'driver_en_route'
  | 'driver_arrived';

interface NotificationRequest {
  type: EventType;
  rideId: string;
  driverId?: string;
  riderId?: string;
  etaMinutes?: number;
}

const DRIVER_STATUS_EVENTS: readonly EventType[] = [
  'driver_assigned',
  'driver_en_route',
  'driver_arrived',
] as const;

async function handleDriverStatus(
  type: 'driver_assigned' | 'driver_en_route' | 'driver_arrived',
  rideId: string,
  etaMinutes: number | undefined,
) {
  const db = getDb();

  const [ride] = await db
    .select({
      riderId: rides.riderId,
      driverId: rides.driverId,
    })
    .from(rides)
    .where(eq(rides.id, rideId))
    .limit(1);

  if (!ride) {
    return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
  }

  const [rider] = await db
    .select({ id: users.id, phone: users.phone })
    .from(users)
    .where(eq(users.id, ride.riderId))
    .limit(1);

  let driverFirstName: string | null = null;
  if (ride.driverId) {
    const [driver] = await db
      .select({ firstName: users.firstName })
      .from(users)
      .where(eq(users.id, ride.driverId))
      .limit(1);
    driverFirstName = driver?.firstName ?? null;
  }

  const message = buildDriverStatusMessage(type, {
    driverFirstName,
    etaMinutes: etaMinutes ?? null,
  });

  const result = await dispatchNotification(
    {
      userId: ride.riderId,
      rideId,
      notificationType: type,
      title: message.title,
      body: message.body,
    },
    rider?.phone ?? null,
  );

  return NextResponse.json({ success: true, type, rideId, dispatch: result });
}

export async function POST(req: Request) {
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

  const { type, rideId, driverId, etaMinutes } = body;
  if (!type || !rideId) {
    return NextResponse.json({ error: 'type and rideId required' }, { status: 400 });
  }

  const db = getDb();

  try {
    if (DRIVER_STATUS_EVENTS.includes(type)) {
      return handleDriverStatus(
        type as 'driver_assigned' | 'driver_en_route' | 'driver_arrived',
        rideId,
        etaMinutes,
      );
    }

    switch (type) {
      case 'ride_accepted': {
        log.info({ event: 'notifications.ride_accepted', rideId }, 'ride accepted');
        return NextResponse.json({ success: true, type, rideId });
      }
      case 'ride_declined': {
        log.info(
          { event: 'notifications.ride_declined', rideId, hasDriver: Boolean(driverId) },
          'ride declined',
        );
        return NextResponse.json({ success: true, type, rideId });
      }
      case 'offer_expired': {
        await db
          .update(rideOffers)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(rideOffers.rideId, rideId));
        log.info({ event: 'notifications.offer_expired', rideId }, 'offer expired');
        return NextResponse.json({ success: true, type, rideId });
      }
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }
  } catch (err) {
    log.error(
      {
        event: 'notifications.ride.error',
        rideId,
        err: err instanceof Error ? err.message : String(err),
      },
      'ride notification failed',
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
