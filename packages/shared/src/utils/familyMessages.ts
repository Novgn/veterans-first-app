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
