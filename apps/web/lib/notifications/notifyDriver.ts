import 'server-only';

/**
 * Notify a driver of a ride event through the shared notification pipeline
 * (FR79/FR80). This is the single implementation used both by the
 * /api/notifications/driver route and by the dispatch console server actions
 * (assign / cancel), so a ride event notifies the driver no matter where it
 * originates — closing the "no caller" gap for that route.
 *
 * Best-effort: it looks up the ride/rider/driver, builds the message, and
 * dispatches (which writes a notification_logs row and attempts push/SMS —
 * real delivery is gated on Twilio/Expo transport config). It NEVER throws, so
 * a notification failure can't fail the console action that triggered it.
 */

import { eq } from 'drizzle-orm';

import { buildDriverRideMessage } from '@veterans-first/shared';
import { getDb, rides, users } from '@veterans-first/shared/db';

import { dispatchNotification } from '@/lib/notifications/dispatch';
import { log } from '@/lib/logger';

export type DriverRideEventType =
  | 'driver_ride_assigned'
  | 'driver_ride_cancelled'
  | 'driver_ride_updated';

export interface NotifyDriverInput {
  type: DriverRideEventType;
  rideId: string;
  driverId: string;
  reason?: string | null;
  changedFields?: string[];
}

/** Returns true if a notification was dispatched, false if it was skipped. */
export async function notifyDriverRideEvent(input: NotifyDriverInput): Promise<boolean> {
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
      .where(eq(rides.id, input.rideId))
      .limit(1);
    if (!ride) return false;

    const [rider] = await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, ride.riderId))
      .limit(1);

    const [driver] = await db
      .select({ id: users.id, phone: users.phone })
      .from(users)
      .where(eq(users.id, input.driverId))
      .limit(1);
    if (!driver) return false;

    const message = buildDriverRideMessage(input.type, {
      riderName: rider ? `${rider.firstName} ${rider.lastName}`.trim() : null,
      pickupAddress: ride.pickupAddress,
      scheduledPickupTime: ride.scheduledPickupTime?.toISOString() ?? '',
      reason: input.reason ?? null,
      changedFields: input.changedFields ?? [],
    });

    await dispatchNotification(
      {
        userId: driver.id,
        rideId: input.rideId,
        notificationType: input.type,
        title: message.title,
        body: message.body,
      },
      driver.phone,
    );
    return true;
  } catch (err) {
    log.error(
      {
        event: 'notifications.driver.error',
        rideId: input.rideId,
        err: err instanceof Error ? err.message : String(err),
      },
      'driver notification failed',
    );
    return false;
  }
}
