/**
 * Pure helpers for driver-facing ride assignment/cancel/update notifications
 * (Story 4.8).
 */

export type DriverRideEvent =
  | "driver_ride_assigned"
  | "driver_ride_cancelled"
  | "driver_ride_updated";

export interface DriverRideContext {
  riderName: string | null;
  pickupAddress: string;
  scheduledPickupTime: string;
  changedFields?: readonly string[];
  reason?: string | null;
}

export interface DriverRideMessage {
  title: string;
  body: string;
}

function formatPickup(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function buildDriverRideMessage(
  event: DriverRideEvent,
  ctx: DriverRideContext
): DriverRideMessage {
  const rider = ctx.riderName ?? "Rider";
  const when = formatPickup(ctx.scheduledPickupTime);

  switch (event) {
    case "driver_ride_assigned":
      return {
        title: "New ride assigned",
        body: `${rider} — pickup ${when} at ${ctx.pickupAddress}.`,
      };
    case "driver_ride_cancelled": {
      const reason = ctx.reason ? ` Reason: ${ctx.reason}.` : "";
      return {
        title: "Ride cancelled",
        body: `${rider}'s ride at ${when} has been cancelled.${reason}`,
      };
    }
    case "driver_ride_updated": {
      const changed =
        ctx.changedFields && ctx.changedFields.length > 0
          ? ` Changed: ${ctx.changedFields.join(", ")}.`
          : "";
      return {
        title: "Ride updated",
        body: `${rider}'s ride at ${when}.${changed}`,
      };
    }
  }
}
