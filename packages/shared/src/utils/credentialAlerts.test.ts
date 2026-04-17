import { describe, expect, it } from "vitest";

import { areRequiredCredentialsVerified, classifyCredential } from "./credentialAlerts";

const today = new Date("2026-04-17T12:00:00Z");

describe("classifyCredential", () => {
  it("classifies far-future verified credential as ok", () => {
    expect(
      classifyCredential({
        expirationDate: "2028-01-01",
        verificationStatus: "verified",
        today,
      })
    ).toBe("ok");
  });

  it("classifies within 30 days as expiring_30_days", () => {
    expect(
      classifyCredential({
        expirationDate: "2026-05-01",
        verificationStatus: "verified",
        today,
      })
    ).toBe("expiring_30_days");
  });

  it("classifies expired credential as expired", () => {
    expect(
      classifyCredential({
        expirationDate: "2026-04-01",
        verificationStatus: "verified",
        today,
      })
    ).toBe("expired");
  });

  it("treats rejected credentials as expired regardless of date", () => {
    expect(
      classifyCredential({
        expirationDate: "2028-01-01",
        verificationStatus: "rejected",
        today,
      })
    ).toBe("expired");
  });

  it("classifies pending credential with no expiration as unknown", () => {
    expect(
      classifyCredential({
        expirationDate: null,
        verificationStatus: "pending",
        today,
      })
    ).toBe("unknown");
  });
});

describe("areRequiredCredentialsVerified", () => {
  it("returns true when license + insurance + background all verified", () => {
    expect(
      areRequiredCredentialsVerified(
        [
          {
            credentialType: "drivers_license",
            verificationStatus: "verified",
            expirationDate: "2028-01-01",
          },
          {
            credentialType: "insurance",
            verificationStatus: "verified",
            expirationDate: "2027-06-01",
          },
          {
            credentialType: "background_check",
            verificationStatus: "verified",
            expirationDate: null,
          },
        ],
        today
      )
    ).toBe(true);
  });

  it("returns false when one credential is still pending", () => {
    expect(
      areRequiredCredentialsVerified(
        [
          {
            credentialType: "drivers_license",
            verificationStatus: "verified",
            expirationDate: "2028-01-01",
          },
          {
            credentialType: "insurance",
            verificationStatus: "pending",
            expirationDate: null,
          },
          {
            credentialType: "background_check",
            verificationStatus: "verified",
            expirationDate: null,
          },
        ],
        today
      )
    ).toBe(false);
  });

  it("returns false when a required credential is expired", () => {
    expect(
      areRequiredCredentialsVerified(
        [
          {
            credentialType: "drivers_license",
            verificationStatus: "verified",
            expirationDate: "2026-04-01",
          },
          {
            credentialType: "insurance",
            verificationStatus: "verified",
            expirationDate: "2028-01-01",
          },
          {
            credentialType: "background_check",
            verificationStatus: "verified",
            expirationDate: null,
          },
        ],
        today
      )
    ).toBe(false);
  });
});
