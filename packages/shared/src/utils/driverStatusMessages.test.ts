import { describe, expect, it } from "vitest";

import { buildDriverStatusMessage } from "./driverStatusMessages";

describe("buildDriverStatusMessage", () => {
  it("driver_assigned mentions driver name + vehicle when provided", () => {
    const message = buildDriverStatusMessage("driver_assigned", {
      driverFirstName: "Mike",
      vehicleDescription: "Blue Toyota Camry",
    });
    expect(message.body).toContain("Mike");
    expect(message.body).toContain("Blue Toyota Camry");
  });

  it("driver_en_route includes ETA when provided", () => {
    const message = buildDriverStatusMessage("driver_en_route", {
      driverFirstName: "Mike",
      etaMinutes: 7,
    });
    expect(message.title).toContain("Mike");
    expect(message.body).toContain("7 min");
  });

  it("falls back to 'Your driver' when name is null", () => {
    const message = buildDriverStatusMessage("driver_arrived", {
      driverFirstName: null,
    });
    expect(message.title).toContain("Your driver");
  });
});
