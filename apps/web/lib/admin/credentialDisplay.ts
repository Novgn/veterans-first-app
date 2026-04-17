/**
 * Credential UI helpers — Story 5.9
 */

export { areRequiredCredentialsVerified, classifyCredential } from '@veterans-first/shared/utils';

const CREDENTIAL_LABELS: Record<string, string> = {
  drivers_license: "Driver's license",
  insurance: 'Vehicle insurance',
  background_check: 'Background check',
  vehicle_registration: 'Vehicle registration',
};

export function humanizeCredentialType(credentialType: string): string {
  return CREDENTIAL_LABELS[credentialType] ?? credentialType;
}
