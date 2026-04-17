/**
 * Pure helpers for ride reminders (Story 4.6).
 *
 * Lives in the shared package so both the web reminder cron route and
 * any future mobile-side jobs share the same copy + dedupe rules.
 */

export type ReminderWindow = 24 | 1;

export interface ReminderMessage {
  title: string;
  body: string;
}

export interface ReminderRide {
  id: string;
  scheduledPickupTime: string;
  pickupAddress: string;
  dropoffAddress: string;
  driverName: string | null;
}

function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function buildReminderMessage(window: ReminderWindow, ride: ReminderRide): ReminderMessage {
  const whenLocal = formatLocalTime(ride.scheduledPickupTime);
  if (window === 24) {
    return {
      title: "Ride tomorrow",
      body: `Reminder: You have a ride on ${whenLocal} from ${ride.pickupAddress} to ${ride.dropoffAddress}.`,
    };
  }
  const driverSuffix = ride.driverName ? ` Your driver is ${ride.driverName}.` : "";
  return {
    title: "Your ride is in 1 hour",
    body: `Pickup at ${ride.pickupAddress} around ${whenLocal}.${driverSuffix}`,
  };
}

export function windowToNotificationType(window: ReminderWindow): "reminder_24h" | "reminder_1h" {
  return window === 24 ? "reminder_24h" : "reminder_1h";
}

/**
 * Returns `[start, end]` timestamps bracketing the target window with a
 * ±5-minute tolerance so we don't miss rides when the cron runs a bit
 * late or a bit early.
 */
export function windowRange(now: Date, window: ReminderWindow): { start: Date; end: Date } {
  const hours = window;
  const target = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const start = new Date(target.getTime() - 5 * 60 * 1000);
  const end = new Date(target.getTime() + 5 * 60 * 1000);
  return { start, end };
}
