import { describe, expect, it } from "vitest";

import { validateDriverOnboarding } from "./driverOnboarding";

const baseInput = {
  firstName: "Dave",
  lastName: "Driver",
  phone: "(555) 123-4567",
  email: " dave@example.com ",
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleYear: "2020",
  vehicleColor: "Silver",
  vehiclePlate: "ABC-1234",
};

describe("validateDriverOnboarding", () => {
  it("normalizes a US phone number to E.164", () => {
    const result = validateDriverOnboarding({ ...baseInput });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.phone).toBe("+15551234567");
    expect(result.value.email).toBe("dave@example.com");
    expect(result.value.credentials).toEqual([]);
  });

  it("returns errors when required fields missing", () => {
    const result = validateDriverOnboarding({
      ...baseInput,
      firstName: "",
      vehicleMake: "",
      phone: "abc",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain("firstName");
    expect(fields).toContain("vehicleMake");
    expect(fields).toContain("phone");
  });

  it("collects credentials when urls/dates provided", () => {
    const result = validateDriverOnboarding({
      ...baseInput,
      licenseUrl: "https://example.com/license.pdf",
      licenseExpiration: "2028-01-01",
      licenseNumber: "DL-9999",
      insuranceUrl: "https://example.com/ins.pdf",
      insuranceExpiration: "2027-06-01",
      backgroundCheckUrl: "https://example.com/bg.pdf",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const types = result.value.credentials.map((c) => c.credentialType);
    expect(types).toEqual(["drivers_license", "insurance", "background_check"]);
  });

  it("omits credentials when only blank fields supplied", () => {
    const result = validateDriverOnboarding({
      ...baseInput,
      licenseUrl: "  ",
      licenseExpiration: "",
      insuranceUrl: null,
      backgroundCheckUrl: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.credentials).toEqual([]);
  });
});
