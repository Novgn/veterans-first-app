/**
 * Trip documentation completeness — Story 5.12
 *
 * Pure classifier. Given a ride + its event trail, reports which of the
 * "documentation required" fields are present. Used by the compliance
 * export and in-UI completeness badges.
 */

export interface TripDocumentationInput {
  pickupTime: string | null;
  dropoffTime: string | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  driverId: string | null;
  mileageKm: number | null;
  photoUrl: string | null;
}

export interface TripDocumentationResult {
  completeFields: string[];
  missingFields: string[];
  complete: boolean;
  requiredFieldCount: number;
}

const REQUIRED_FIELDS: Array<keyof TripDocumentationInput> = [
  "pickupTime",
  "dropoffTime",
  "pickupAddress",
  "dropoffAddress",
  "driverId",
];

const OPTIONAL_FIELDS: Array<keyof TripDocumentationInput> = ["mileageKm", "photoUrl"];

function isPresent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return true;
}

export function classifyTripDocumentation(input: TripDocumentationInput): TripDocumentationResult {
  const complete: string[] = [];
  const missing: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (isPresent(input[field])) complete.push(field);
    else missing.push(field);
  }
  for (const field of OPTIONAL_FIELDS) {
    if (isPresent(input[field])) complete.push(field);
    // missing optional fields don't affect completeness
  }
  return {
    completeFields: complete,
    missingFields: missing,
    complete: missing.length === 0,
    requiredFieldCount: REQUIRED_FIELDS.length,
  };
}

export const HIPAA_ACCESS_ACTIONS = [
  "rider_viewed",
  "rider_profile_accessed",
  "phi_accessed",
  "rider_search_performed",
] as const;

export type HipaaAccessAction = (typeof HIPAA_ACCESS_ACTIONS)[number];
