/**
 * Family-facing notification copy (Story 4.9 + 4.10).
 */

export interface FamilyPickupContext {
  riderFirstName: string;
  driverFirstName: string | null;
  pickupAddress: string;
}

export interface FamilyArrivalContext {
  riderFirstName: string;
  arrivalAddress: string;
  hasPhoto: boolean;
  photoUrl?: string | null;
}

export interface RideEventLike {
  eventType: string;
  photoUrl: string | null;
  createdAt: Date | string;
}

/**
 * Given a ride's events, return the URL of the most recent arrival
 * photo (null when none was captured).
 */
export function pickArrivalPhotoUrl(events: readonly RideEventLike[]): string | null {
  const arrivals = events
    .filter((e) => e.eventType === "arrived" && e.photoUrl)
    .sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );
  return arrivals[0]?.photoUrl ?? null;
}

export interface FamilyMessage {
  title: string;
  body: string;
}

export function buildFamilyPickupMessage(ctx: FamilyPickupContext): FamilyMessage {
  const driverPart = ctx.driverFirstName ? ` by ${ctx.driverFirstName}` : "";
  return {
    title: `${ctx.riderFirstName} was picked up`,
    body: `${ctx.riderFirstName} was picked up${driverPart} from ${ctx.pickupAddress}.`,
  };
}

export function buildFamilyArrivalMessage(ctx: FamilyArrivalContext): FamilyMessage {
  const photoPart = ctx.hasPhoto ? " Photo attached." : "";
  return {
    title: `${ctx.riderFirstName} arrived safely`,
    body: `${ctx.riderFirstName} arrived at ${ctx.arrivalAddress}.${photoPart}`,
  };
}
