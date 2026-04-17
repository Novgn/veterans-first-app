// Ride reminder cron endpoint (Story 4.6).
//
// POST /api/notifications/reminders
// Body: { windowMinutes: 60 | 1440 }
//
// Called by Vercel Cron (or external scheduler) with a Clerk-issued
// service token. Scans `rides` for pickups within the target window and
// dispatches a reminder for each rider that hasn't already been
// reminded for this window. Dedupe is done via `notification_logs`.

import { and, between, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, rides, users } from '@veterans-first/shared/db';

import { getCurrentUserId } from '@/lib/auth/roles';
import { dispatchNotification, hasDispatched } from '@/lib/notifications/dispatch';
import {
  buildReminderMessage,
  windowRange,
  windowToNotificationType,
  type ReminderWindow,
} from '@/lib/notifications/reminders';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ReminderRequest {
  windowMinutes?: number;
}

function parseWindow(minutes: number | undefined): ReminderWindow {
  if (minutes === 1440) return 24;
  return 1;
}

export async function POST(req: Request) {
  const caller = await getCurrentUserId();
  if (!caller) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: ReminderRequest = {};
  try {
    body = (await req.json()) as ReminderRequest;
  } catch {
    // empty body is fine, use defaults
  }

  const window = parseWindow(body.windowMinutes);
  const { start, end } = windowRange(new Date(), window);
  const db = getDb();

  const candidates = await db
    .select({
      id: rides.id,
      riderId: rides.riderId,
      driverId: rides.driverId,
      scheduledPickupTime: rides.scheduledPickupTime,
      pickupAddress: rides.pickupAddress,
      dropoffAddress: rides.dropoffAddress,
      status: rides.status,
    })
    .from(rides)
    .where(
      and(
        between(rides.scheduledPickupTime, start, end),
        // Only remind for rides that haven't ended.
        eq(rides.status, 'confirmed'),
      ),
    );

  const notificationType = windowToNotificationType(window);
  let dispatched = 0;
  let skipped = 0;

  for (const ride of candidates) {
    const alreadySent = await hasDispatched(ride.riderId, ride.id, notificationType);
    if (alreadySent) {
      skipped++;
      continue;
    }

    const [rider] = await db
      .select({ phone: users.phone })
      .from(users)
      .where(eq(users.id, ride.riderId))
      .limit(1);

    let driverName: string | null = null;
    if (ride.driverId) {
      const [driver] = await db
        .select({ firstName: users.firstName })
        .from(users)
        .where(eq(users.id, ride.driverId))
        .limit(1);
      driverName = driver?.firstName ?? null;
    }

    const message = buildReminderMessage(window, {
      id: ride.id,
      scheduledPickupTime: ride.scheduledPickupTime?.toISOString() ?? '',
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      driverName,
    });

    await dispatchNotification(
      {
        userId: ride.riderId,
        rideId: ride.id,
        notificationType,
        title: message.title,
        body: message.body,
      },
      rider?.phone ?? null,
    );
    dispatched++;
  }

  log.info(
    {
      event: 'notifications.reminders.run',
      window,
      candidates: candidates.length,
      dispatched,
      skipped,
    },
    'reminder run complete',
  );

  return NextResponse.json({ window, candidates: candidates.length, dispatched, skipped });
}
