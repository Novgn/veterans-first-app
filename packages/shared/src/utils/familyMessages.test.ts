import { describe, expect, it } from "vitest";

import { buildFamilyArrivalMessage, buildFamilyPickupMessage } from "./familyMessages";

describe("buildFamilyPickupMessage", () => {
  it("includes driver name when provided", () => {
    const msg = buildFamilyPickupMessage({
      riderFirstName: "John",
      driverFirstName: "Mike",
      pickupAddress: "123 Main",
    });
    expect(msg.title).toContain("John");
    expect(msg.body).toContain("Mike");
    expect(msg.body).toContain("123 Main");
  });

  it("omits driver phrase when driver name is null", () => {
    const msg = buildFamilyPickupMessage({
      riderFirstName: "John",
      driverFirstName: null,
      pickupAddress: "123 Main",
    });
    expect(msg.body).not.toContain("by ");
  });
});

describe("buildFamilyArrivalMessage", () => {
  it("mentions photo when hasPhoto is true", () => {
    const msg = buildFamilyArrivalMessage({
      riderFirstName: "John",
      arrivalAddress: "VA Clinic",
      hasPhoto: true,
    });
    expect(msg.title).toContain("arrived safely");
    expect(msg.body).toContain("Photo attached");
  });

  it("omits photo phrase when hasPhoto is false", () => {
    const msg = buildFamilyArrivalMessage({
      riderFirstName: "John",
      arrivalAddress: "VA Clinic",
      hasPhoto: false,
    });
    expect(msg.body).not.toContain("Photo");
  });
});
