import { describe, expect, it } from "vitest";

import { buildDriverRideMessage } from "./driverRideMessages";

const base = {
  riderName: "Jane",
  pickupAddress: "123 Main St",
  scheduledPickupTime: "2026-05-01T10:30:00Z",
};

describe("buildDriverRideMessage", () => {
  it("driver_ride_assigned includes rider + pickup", () => {
    const message = buildDriverRideMessage("driver_ride_assigned", base);
    expect(message.title).toBe("New ride assigned");
    expect(message.body).toContain("Jane");
    expect(message.body).toContain("123 Main St");
  });

  it("driver_ride_cancelled surfaces reason when provided", () => {
    const message = buildDriverRideMessage("driver_ride_cancelled", {
      ...base,
      reason: "rider rescheduled",
    });
    expect(message.title).toBe("Ride cancelled");
    expect(message.body).toContain("rider rescheduled");
  });

  it("driver_ride_updated lists changed fields", () => {
    const message = buildDriverRideMessage("driver_ride_updated", {
      ...base,
      changedFields: ["pickup time", "pickup address"],
    });
    expect(message.title).toBe("Ride updated");
    expect(message.body).toContain("pickup time");
    expect(message.body).toContain("pickup address");
  });
});
