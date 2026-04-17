import { describe, expect, it } from "vitest";

import { buildDeactivationAuditPayload, classifyDriverRides } from "./driverDeactivation";

describe("classifyDriverRides", () => {
  it("treats confirmed / assigned / pending as reassignable", () => {
    const result = classifyDriverRides([
      { id: "r1", status: "pending" },
      { id: "r2", status: "confirmed" },
      { id: "r3", status: "assigned" },
      { id: "r4", status: "pending_acceptance" },
    ]);
    expect(result.canDeactivate).toBe(true);
    expect(result.reassignable).toHaveLength(4);
    expect(result.blocking).toHaveLength(0);
  });

  it("blocks when driver has any in-progress ride", () => {
    const result = classifyDriverRides([
      { id: "r1", status: "confirmed" },
      { id: "r2", status: "en_route" },
    ]);
    expect(result.canDeactivate).toBe(false);
    expect(result.blocking).toEqual([{ id: "r2", status: "en_route" }]);
    expect(result.reassignable).toEqual([{ id: "r1", status: "confirmed" }]);
  });

  it("ignores statuses that are neither reassignable nor blocking", () => {
    const result = classifyDriverRides([
      { id: "r1", status: "completed" },
      { id: "r2", status: "cancelled" },
      { id: "r3", status: "no_show" },
    ]);
    expect(result.canDeactivate).toBe(true);
    expect(result.reassignable).toHaveLength(0);
    expect(result.blocking).toHaveLength(0);
  });
});

describe("buildDeactivationAuditPayload", () => {
  it("sorts ride ids for deterministic audit output", () => {
    const payload = buildDeactivationAuditPayload("d1", [
      { id: "r-b", status: "confirmed" },
      { id: "r-a", status: "confirmed" },
    ]);
    expect(payload).toEqual({
      driverId: "d1",
      reassignedRideIds: ["r-a", "r-b"],
    });
  });

  it("handles empty ride list", () => {
    const payload = buildDeactivationAuditPayload("d1", []);
    expect(payload).toEqual({ driverId: "d1", reassignedRideIds: [] });
  });
});
