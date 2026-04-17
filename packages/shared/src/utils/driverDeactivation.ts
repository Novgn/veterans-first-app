/**
 * Driver deactivation helpers — Story 5.2
 *
 * Pure helpers for the admin driver-deactivation flow. The server action
 * that runs the actual DB writes lives in `apps/web/lib/admin/`; this
 * module only handles the classification + audit payload construction so
 * it's trivially testable without a DB.
 */

/**
 * Ride statuses that are safe to strip a driver assignment from without
 * disrupting an in-progress trip. A ride in `en_route`, `in_progress`,
 * or `arrived` must never be force-unassigned — the admin UI should
 * block deactivation until those resolve.
 */
export const REASSIGNABLE_RIDE_STATUSES = [
  "pending",
  "confirmed",
  "assigned",
  "pending_acceptance",
] as const;

export type ReassignableRideStatus = (typeof REASSIGNABLE_RIDE_STATUSES)[number];

export const BLOCKING_RIDE_STATUSES = ["en_route", "in_progress", "arrived"] as const;

export type BlockingRideStatus = (typeof BLOCKING_RIDE_STATUSES)[number];

export interface DriverRideSummary {
  id: string;
  status: string;
}

export interface DeactivationClassification {
  canDeactivate: boolean;
  reassignable: DriverRideSummary[];
  blocking: DriverRideSummary[];
}

export function classifyDriverRides(rides: DriverRideSummary[]): DeactivationClassification {
  const reassignable: DriverRideSummary[] = [];
  const blocking: DriverRideSummary[] = [];
  const reassignableSet = new Set<string>(REASSIGNABLE_RIDE_STATUSES);
  const blockingSet = new Set<string>(BLOCKING_RIDE_STATUSES);

  for (const ride of rides) {
    if (reassignableSet.has(ride.status)) reassignable.push(ride);
    else if (blockingSet.has(ride.status)) blocking.push(ride);
  }

  return {
    canDeactivate: blocking.length === 0,
    reassignable,
    blocking,
  };
}

export interface DeactivationAuditPayload {
  driverId: string;
  reassignedRideIds: string[];
}

export function buildDeactivationAuditPayload(
  driverId: string,
  reassignable: DriverRideSummary[]
): DeactivationAuditPayload {
  return {
    driverId,
    reassignedRideIds: reassignable.map((r) => r.id).sort(),
  };
}
