import { describe, expect, it } from "vitest";

import { classifyTripDocumentation } from "./tripDocumentation";

describe("classifyTripDocumentation", () => {
  it("reports complete when all required fields present", () => {
    const result = classifyTripDocumentation({
      pickupTime: "2026-04-17T10:00:00Z",
      dropoffTime: "2026-04-17T10:30:00Z",
      pickupAddress: "123 A St",
      dropoffAddress: "456 B Ave",
      driverId: "d1",
      mileageKm: 4.2,
      photoUrl: "https://example.com/p.jpg",
    });
    expect(result.complete).toBe(true);
    expect(result.missingFields).toEqual([]);
    expect(result.completeFields).toHaveLength(7);
  });

  it("flags missing required field but allows missing photo", () => {
    const result = classifyTripDocumentation({
      pickupTime: "2026-04-17T10:00:00Z",
      dropoffTime: null,
      pickupAddress: "123 A St",
      dropoffAddress: "456 B Ave",
      driverId: "d1",
      mileageKm: 4.2,
      photoUrl: null,
    });
    expect(result.complete).toBe(false);
    expect(result.missingFields).toEqual(["dropoffTime"]);
    // photo missing is allowed
    expect(result.completeFields).toContain("mileageKm");
  });

  it("treats empty strings and zero mileage as absent", () => {
    const result = classifyTripDocumentation({
      pickupTime: "",
      dropoffTime: "2026-04-17T10:30:00Z",
      pickupAddress: "   ",
      dropoffAddress: "456 B Ave",
      driverId: "d1",
      mileageKm: 0,
      photoUrl: null,
    });
    expect(result.complete).toBe(false);
    expect(result.missingFields).toEqual(["pickupTime", "pickupAddress"]);
    expect(result.completeFields).not.toContain("mileageKm");
  });
});
