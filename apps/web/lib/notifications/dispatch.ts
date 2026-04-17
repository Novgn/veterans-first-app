import 'server-only';

/**
 * Notification dispatcher (Story 4.6, extended by 4.7–4.10).
 *
 * Given a user id + notification payload, this function:
 *   1. Reads the user's `notification_preferences` row (or defaults).
 *   2. Decides which channels and types are allowed.
 *   3. Dispatches through the stubbed push + SMS transports.
 *   4. Writes a `notification_logs` row per attempt (including skipped).
 *
 * The push/SMS transports intentionally log + return. Actual Expo Push
 * + Twilio wiring is tracked as a deferred finding for Epic 4.
 */

import { and, desc, eq, inArray } from 'drizzle-orm';

import {
  DEFAULT_NOTIFICATION_PREFERENCES_ROW,
  getDb,
  notificationLogs,
  notificationPreferences,
  type NotificationLog,
} from '@veterans-first/shared/db';

import { log } from '@/lib/logger';

export type NotificationType =
  | 'reminder_24h'
  | 'reminder_1h'
  | 'driver_assigned'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'driver_ride_assigned'
  | 'driver_ride_cancelled'
  | 'driver_ride_updated'
  | 'family_pickup'
  | 'family_arrival';

export type NotificationChannel = 'push' | 'sms';

export interface NotificationPayload {
  userId: string;
  rideId?: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  /**
   * Optional URL for rich payloads (e.g., arrival photo on family_arrival).
   */
  imageUrl?: string;
}

export interface DispatchResult {
  attempted: NotificationChannel[];
  sent: NotificationChannel[];
  skipped: NotificationChannel[];
  logs: NotificationLog[];
}

const TYPE_TO_PREFERENCE_GATE: Record<
  NotificationType,
  keyof typeof DEFAULT_NOTIFICATION_PREFERENCES_ROW
> = {
  reminder_24h: 'remindersEnabled',
  reminder_1h: 'remindersEnabled',
  driver_assigned: 'driverUpdatesEnabled',
  driver_en_route: 'driverUpdatesEnabled',
  driver_arrived: 'driverUpdatesEnabled',
  driver_ride_assigned: 'driverUpdatesEnabled',
  driver_ride_cancelled: 'driverUpdatesEnabled',
  driver_ride_updated: 'driverUpdatesEnabled',
  family_pickup: 'driverUpdatesEnabled',
  family_arrival: 'arrivalPhotosEnabled',
};

async function loadPrefs(userId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);
  return rows[0] ?? { ...DEFAULT_NOTIFICATION_PREFERENCES_ROW, userId };
}

async function sendPush(payload: NotificationPayload, pushToken: string | null): Promise<boolean> {
  if (!pushToken) return false;
  // TODO(Epic 5): wire Expo Push / FCM. Log only numeric/enum metadata
  // to dodge log forging (CWE-117) — user-controlled strings don't hit
  // the logger here.
  log.info(
    {
      event: 'notifications.push.attempt',
      userIdLen: payload.userId.length,
      typeLen: payload.notificationType.length,
      tokenLen: pushToken.length,
      titleLen: payload.title.length,
    },
    'dispatched push',
  );
  return true;
}

async function sendSms(payload: NotificationPayload, phone: string | null): Promise<boolean> {
  if (!phone) return false;
  // TODO(Epic 5): wire Twilio. Same guard as sendPush.
  log.info(
    {
      event: 'notifications.sms.attempt',
      userIdLen: payload.userId.length,
      typeLen: payload.notificationType.length,
      phoneLen: phone.length,
      bodyLen: payload.body.length,
    },
    'dispatched sms',
  );
  return true;
}

/**
 * Returns true when a log row already exists for this user+ride+type —
 * used by reminder dedupe so cron overlap is safe.
 */
export async function hasDispatched(
  userId: string,
  rideId: string,
  notificationType: NotificationType,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: notificationLogs.id })
    .from(notificationLogs)
    .where(
      and(
        eq(notificationLogs.userId, userId),
        eq(notificationLogs.rideId, rideId),
        eq(notificationLogs.notificationType, notificationType),
        inArray(notificationLogs.status, ['sent', 'delivered']),
      ),
    )
    .orderBy(desc(notificationLogs.createdAt))
    .limit(1);
  return rows.length > 0;
}

export async function dispatchNotification(
  payload: NotificationPayload,
  phone: string | null,
): Promise<DispatchResult> {
  const db = getDb();
  const prefs = await loadPrefs(payload.userId);
  const gate = TYPE_TO_PREFERENCE_GATE[payload.notificationType];
  const typeEnabled = Boolean(prefs[gate]);

  const channels: NotificationChannel[] = ['push', 'sms'];
  const attempted: NotificationChannel[] = [];
  const sent: NotificationChannel[] = [];
  const skipped: NotificationChannel[] = [];
  const logs: NotificationLog[] = [];

  for (const channel of channels) {
    attempted.push(channel);
    const channelEnabled = channel === 'push' ? prefs.pushEnabled : prefs.smsEnabled;
    const allow = typeEnabled && channelEnabled;
    let delivered = false;

    if (allow) {
      delivered =
        channel === 'push'
          ? await sendPush(payload, prefs.pushToken ?? null)
          : await sendSms(payload, phone);
    }

    const status: 'sent' | 'skipped' | 'failed' = !allow
      ? 'skipped'
      : delivered
        ? 'sent'
        : 'failed';

    if (status === 'sent') sent.push(channel);
    else skipped.push(channel);

    // Short-term: serialize imageUrl into content so the mobile history
    // view can surface the arrival photo without a schema change.
    // Tracked in deferred-findings for a proper `metadata jsonb` column.
    const contentWithImage = payload.imageUrl
      ? `${payload.title}\n${payload.body}\nphoto:${payload.imageUrl}`
      : `${payload.title}\n${payload.body}`;

    const [logRow] = await db
      .insert(notificationLogs)
      .values({
        userId: payload.userId,
        rideId: payload.rideId ?? null,
        notificationType: payload.notificationType,
        channel,
        content: contentWithImage,
        status,
      })
      .returning();
    if (logRow) logs.push(logRow);
  }

  return { attempted, sent, skipped, logs };
}
