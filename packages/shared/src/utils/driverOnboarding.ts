/**
 * Driver onboarding validation helpers — Story 5.3
 *
 * Pure validator for the admin "Add Driver" form. Normalizes the phone
 * number to E.164 (project rule) and trims free-text fields.
 */

export interface DriverOnboardingInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string | null;
  vehicleColor: string;
  vehiclePlate: string;
  yearsExperience?: string | null;
  licenseUrl?: string | null;
  licenseNumber?: string | null;
  licenseExpiration?: string | null;
  insuranceUrl?: string | null;
  insuranceExpiration?: string | null;
  backgroundCheckUrl?: string | null;
}

export interface NormalizedDriverOnboarding {
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  vehicle: {
    make: string;
    model: string;
    year: string | null;
    color: string;
    plate: string;
  };
  yearsExperience: string | null;
  credentials: Array<{
    credentialType: "drivers_license" | "insurance" | "background_check";
    credentialNumber: string | null;
    expirationDate: string | null;
    documentUrl: string | null;
  }>;
}

export interface DriverOnboardingError {
  field: keyof DriverOnboardingInput | "credentials";
  message: string;
}

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (E164_REGEX.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateDriverOnboarding(
  input: DriverOnboardingInput
):
  | { ok: true; value: NormalizedDriverOnboarding }
  | { ok: false; errors: DriverOnboardingError[] } {
  const errors: DriverOnboardingError[] = [];

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const vehicleMake = input.vehicleMake.trim();
  const vehicleModel = input.vehicleModel.trim();
  const vehicleColor = input.vehicleColor.trim();
  const vehiclePlate = input.vehiclePlate.trim();

  if (!firstName) errors.push({ field: "firstName", message: "First name is required." });
  if (!lastName) errors.push({ field: "lastName", message: "Last name is required." });
  if (!vehicleMake) errors.push({ field: "vehicleMake", message: "Vehicle make is required." });
  if (!vehicleModel) errors.push({ field: "vehicleModel", message: "Vehicle model is required." });
  if (!vehicleColor) errors.push({ field: "vehicleColor", message: "Vehicle color is required." });
  if (!vehiclePlate) errors.push({ field: "vehiclePlate", message: "Vehicle plate is required." });

  const phone = normalizePhone(input.phone);
  if (!phone) {
    errors.push({ field: "phone", message: "Phone must be a valid US number or E.164 format." });
  }

  if (errors.length > 0) return { ok: false, errors };

  const credentials: NormalizedDriverOnboarding["credentials"] = [];
  const licenseUrl = trimOrNull(input.licenseUrl);
  const licenseNumber = trimOrNull(input.licenseNumber);
  const licenseExpiration = trimOrNull(input.licenseExpiration);
  if (licenseUrl || licenseNumber || licenseExpiration) {
    credentials.push({
      credentialType: "drivers_license",
      credentialNumber: licenseNumber,
      expirationDate: licenseExpiration,
      documentUrl: licenseUrl,
    });
  }

  const insuranceUrl = trimOrNull(input.insuranceUrl);
  const insuranceExpiration = trimOrNull(input.insuranceExpiration);
  if (insuranceUrl || insuranceExpiration) {
    credentials.push({
      credentialType: "insurance",
      credentialNumber: null,
      expirationDate: insuranceExpiration,
      documentUrl: insuranceUrl,
    });
  }

  const backgroundCheckUrl = trimOrNull(input.backgroundCheckUrl);
  if (backgroundCheckUrl) {
    credentials.push({
      credentialType: "background_check",
      credentialNumber: null,
      expirationDate: null,
      documentUrl: backgroundCheckUrl,
    });
  }

  return {
    ok: true,
    value: {
      firstName,
      lastName,
      phone: phone as string,
      email: trimOrNull(input.email),
      vehicle: {
        make: vehicleMake,
        model: vehicleModel,
        year: trimOrNull(input.vehicleYear),
        color: vehicleColor,
        plate: vehiclePlate,
      },
      yearsExperience: trimOrNull(input.yearsExperience),
      credentials,
    },
  };
}
