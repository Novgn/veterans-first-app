/**
 * Pure helpers for driver-status rider notifications (Story 4.7).
 */

export type DriverStatusEvent = "driver_assigned" | "driver_en_route" | "driver_arrived";

export interface DriverStatusContext {
  driverFirstName: string | null;
  etaMinutes?: number | null;
  vehicleDescription?: string | null;
}

export interface DriverStatusMessage {
  title: string;
  body: string;
}

export function buildDriverStatusMessage(
  event: DriverStatusEvent,
  ctx: DriverStatusContext
): DriverStatusMessage {
  const name = ctx.driverFirstName ?? "Your driver";

  switch (event) {
    case "driver_assigned":
      return {
        title: "Driver assigned",
        body: ctx.vehicleDescription
          ? `${name} is your driver (${ctx.vehicleDescription}).`
          : `${name} is your driver.`,
      };
    case "driver_en_route": {
      const eta =
        typeof ctx.etaMinutes === "number" && ctx.etaMinutes > 0
          ? ` ETA ${ctx.etaMinutes} min.`
          : "";
      return { title: `${name} is on the way`, body: `${name} is heading to pickup.${eta}` };
    }
    case "driver_arrived":
      return {
        title: `${name} has arrived`,
        body: ctx.vehicleDescription
          ? `Look for ${ctx.vehicleDescription}.`
          : `They're waiting for you at the pickup location.`,
      };
  }
}
