/**
 * Driver credential classification — Story 5.9
 *
 * Pure helpers so the admin UI, the cron alert route, and the roster
 * activation check share one definition of "expired" / "expiring
 * soon" / "verified". Dates are handled as ISO yyyy-mm-dd strings to
 * match the DB `date` columns.
 */

export const CREDENTIAL_EXPIRATION_WARN_DAYS = 30;

export const REQUIRED_CREDENTIAL_TYPES = [
  "drivers_license",
  "insurance",
  "background_check",
] as const;

export type RequiredCredentialType = (typeof REQUIRED_CREDENTIAL_TYPES)[number];

export type CredentialClassification = "expired" | "expiring_30_days" | "ok" | "unknown";

export interface CredentialClassificationInput {
  expirationDate: string | null;
  verificationStatus: string;
  today?: Date;
}

function daysBetween(fromIso: string, toDate: Date): number {
  const from = new Date(`${fromIso}T00:00:00Z`).getTime();
  const to = Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate());
  return Math.round((from - to) / (24 * 60 * 60 * 1000));
}

export function classifyCredential(input: CredentialClassificationInput): CredentialClassification {
  const today = input.today ?? new Date();
  if (input.verificationStatus === "rejected") return "expired";
  if (!input.expirationDate) {
    return input.verificationStatus === "verified" ? "ok" : "unknown";
  }
  const days = daysBetween(input.expirationDate, today);
  if (days < 0) return "expired";
  if (days <= CREDENTIAL_EXPIRATION_WARN_DAYS) return "expiring_30_days";
  return "ok";
}

export interface CredentialForActivation {
  credentialType: string;
  verificationStatus: string;
  expirationDate: string | null;
}

export function areRequiredCredentialsVerified(
  rows: CredentialForActivation[],
  today: Date = new Date()
): boolean {
  const required = new Set<RequiredCredentialType>(REQUIRED_CREDENTIAL_TYPES);
  for (const row of rows) {
    if (!required.has(row.credentialType as RequiredCredentialType)) continue;
    if (row.verificationStatus !== "verified") continue;
    const classification = classifyCredential({
      expirationDate: row.expirationDate,
      verificationStatus: row.verificationStatus,
      today,
    });
    if (classification === "ok" || classification === "expiring_30_days") {
      required.delete(row.credentialType as RequiredCredentialType);
    }
  }
  return required.size === 0;
}
