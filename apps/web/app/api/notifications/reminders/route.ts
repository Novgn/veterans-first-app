// Ride reminder cron endpoint (Story 4.6).
//
// POST /api/notifications/reminders
// Body: { windowMinutes: 60 | 1440 }
//
// Machine-only endpoint. Authenticated with a shared CRON_SECRET bearer token
// (set the same value on the Vercel Cron job / external scheduler). It does NOT
// accept an interactive user session — previously any signed-in user could
// trigger the sweep. Fails closed: with no CRON_SECRET configured it returns
// 503. Scans `rides` for pickups within the target window and dispatches a
// reminder for each rider not already reminded for this window; dedupe via
// `notification_logs`.

import crypto from 'node:crypto';

import { and, between, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, rides, users } from '@veterans-first/shared/db';

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

// Constant-time compare so a mismatched token can't be timed byte-by-byte.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    log.error({ event: 'notifications.reminders.unconfigured' }, 'CRON_SECRET unset; rejecting');
    return NextResponse.json({ error: 'cron not configured' }, { status: 503 });
  }
  const authHeader = req.headers.get('authorization') ?? '';
  if (!safeEqual(authHeader, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
