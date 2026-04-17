import { describe, expect, it } from "vitest";

import {
  formatRatePercent,
  summarizeOperationalRides,
  windowToRange,
  type RideForOperationalMetrics,
} from "./operationalMetrics";

describe("summarizeOperationalRides", () => {
  it("returns null rates for empty window", () => {
    const result = summarizeOperationalRides([]);
    expect(result.totalRides).toBe(0);
    expect(result.completionRate).toBeNull();
    expect(result.noShowRate).toBeNull();
    expect(result.perDay).toEqual([]);
  });

  it("computes rates from mixed statuses", () => {
    const rides: RideForOperationalMetrics[] = [
      {
        id: "r1",
        status: "completed",
        scheduledPickupTime: "2026-04-17T10:00:00Z",
        completedAt: null,
      },
      {
        id: "r2",
        status: "completed",
        scheduledPickupTime: "2026-04-17T11:00:00Z",
        completedAt: null,
      },
      {
        id: "r3",
        status: "no_show",
        scheduledPickupTime: "2026-04-17T12:00:00Z",
        completedAt: null,
      },
      {
        id: "r4",
        status: "cancelled",
        scheduledPickupTime: "2026-04-17T13:00:00Z",
        completedAt: null,
      },
    ];
    const result = summarizeOperationalRides(rides);
    expect(result.totalRides).toBe(4);
    expect(result.completedRides).toBe(2);
    expect(result.noShowRides).toBe(1);
    expect(result.cancelledRides).toBe(1);
    expect(result.completionRate).toBe(0.5);
    expect(result.noShowRate).toBe(0.25);
  });

  it("buckets rides by scheduled pickup date", () => {
    const rides: RideForOperationalMetrics[] = [
      {
        id: "r1",
        status: "completed",
        scheduledPickupTime: "2026-04-17T10:00:00Z",
        completedAt: null,
      },
      {
        id: "r2",
        status: "completed",
        scheduledPickupTime: "2026-04-18T10:00:00Z",
        completedAt: null,
      },
      {
        id: "r3",
        status: "no_show",
        scheduledPickupTime: "2026-04-18T14:00:00Z",
        completedAt: null,
      },
    ];
    const result = summarizeOperationalRides(rides);
    expect(result.perDay).toEqual([
      { date: "2026-04-18", total: 2, completed: 1, noShow: 1, cancelled: 0 },
      { date: "2026-04-17", total: 1, completed: 1, noShow: 0, cancelled: 0 },
    ]);
  });

  it("falls back to completedAt when scheduled pickup is missing", () => {
    const rides: RideForOperationalMetrics[] = [
      {
        id: "r1",
        status: "completed",
        scheduledPickupTime: null,
        completedAt: "2026-04-15T18:30:00Z",
      },
    ];
    const result = summarizeOperationalRides(rides);
    expect(result.perDay).toEqual([
      { date: "2026-04-15", total: 1, completed: 1, noShow: 0, cancelled: 0 },
    ]);
  });
});

describe("formatRatePercent", () => {
  it("returns em dash for null", () => {
    expect(formatRatePercent(null)).toBe("—");
  });
  it("rounds to one decimal", () => {
    expect(formatRatePercent(0.12345)).toBe("12.3%");
  });
});

describe("windowToRange", () => {
  it("today is a one-day window", () => {
    const range = windowToRange("today", new Date("2026-04-17T09:00:00Z"));
    expect(range.startIso).toBe("2026-04-17T00:00:00.000Z");
    expect(range.endExclusiveIso).toBe("2026-04-18T00:00:00.000Z");
  });

  it("7d covers seven calendar days ending today", () => {
    const range = windowToRange("7d", new Date("2026-04-17T09:00:00Z"));
    expect(range.startIso).toBe("2026-04-11T00:00:00.000Z");
    expect(range.endExclusiveIso).toBe("2026-04-18T00:00:00.000Z");
  });
});
