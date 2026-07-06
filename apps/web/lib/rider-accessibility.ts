// Rider accessibility helpers — shared between the dispatch rider-detail page
// and the assignment view so the "needs a wheelchair-accessible vehicle" signal
// is derived one way everywhere. Pure functions; safe to import anywhere.

export interface RiderAccessibility {
  mobility_aid?: string | null;
  needs_door_assistance?: boolean | null;
  needs_package_assistance?: boolean | null;
  extra_vehicle_space?: boolean | null;
  special_equipment_notes?: string | null;
}

export const MOBILITY_AID_LABELS: Record<string, string> = {
  none: 'No mobility aid',
  cane: 'Cane',
  walker: 'Walker',
  manual_wheelchair: 'Manual wheelchair',
  power_wheelchair: 'Power wheelchair',
};

const WHEELCHAIR_AIDS = new Set(['manual_wheelchair', 'power_wheelchair']);

/** Human label for a mobility aid, or null for none/unset. */
export function mobilityAidLabel(aid: string | null | undefined): string | null {
  if (!aid || aid === 'none') return null;
  return MOBILITY_AID_LABELS[aid] ?? aid;
}

/**
 * True when the rider uses a wheelchair or has requested extra vehicle space —
 * i.e. a standard sedan may not be appropriate and a wheelchair-accessible
 * vehicle should be considered. This is the assignment-time safety signal.
 */
export function requiresAccessibleVehicle(a: RiderAccessibility | null | undefined): boolean {
  if (!a) return false;
  const usesWheelchair = a.mobility_aid != null && WHEELCHAIR_AIDS.has(a.mobility_aid);
  return usesWheelchair || a.extra_vehicle_space === true;
}

/**
 * Short label for the assignment-row badge, e.g. "Power wheelchair" or
 * "Extra vehicle space". Null when there is nothing notable to flag.
 */
export function accessibilityBadgeLabel(a: RiderAccessibility | null | undefined): string | null {
  if (!a) return null;
  if (a.mobility_aid != null && WHEELCHAIR_AIDS.has(a.mobility_aid)) {
    return MOBILITY_AID_LABELS[a.mobility_aid] ?? 'Wheelchair';
  }
  if (a.extra_vehicle_space === true) return 'Extra vehicle space';
  return null;
}

/**
 * Supabase returns an embedded to-one relation as either an object or a
 * single-element array depending on how the FK is introspected. Normalize to a
 * single record (or null).
 */
export function firstRelation<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}
