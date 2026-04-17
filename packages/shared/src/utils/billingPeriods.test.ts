import { describe, expect, it } from "vitest";

import { billingPeriodToTimestampRange, previousBillingPeriod } from "./billingPeriods";

describe("previousBillingPeriod weekly", () => {
  it("Sunday → Saturday window for a Monday reference", () => {
    // 2026-04-13 is a Monday. Previous week runs Sun 2026-04-05 → Sat 2026-04-11.
    const result = previousBillingPeriod("weekly", new Date("2026-04-13T12:00:00Z"));
    expect(result.startIso).toBe("2026-04-05");
    expect(result.endIso).toBe("2026-04-11");
  });

  it("wraps across year boundary", () => {
    // 2026-01-05 is a Monday. Previous week runs Sun 2025-12-28 → Sat 2026-01-03.
    const result = previousBillingPeriod("weekly", new Date("2026-01-05T12:00:00Z"));
    expect(result.startIso).toBe("2025-12-28");
    expect(result.endIso).toBe("2026-01-03");
  });
});

describe("previousBillingPeriod monthly", () => {
  it("previous calendar month for mid-month reference", () => {
    const result = previousBillingPeriod("monthly", new Date("2026-04-17T12:00:00Z"));
    expect(result.startIso).toBe("2026-03-01");
    expect(result.endIso).toBe("2026-03-31");
  });

  it("wraps across year boundary", () => {
    const result = previousBillingPeriod("monthly", new Date("2026-01-15T12:00:00Z"));
    expect(result.startIso).toBe("2025-12-01");
    expect(result.endIso).toBe("2025-12-31");
  });
});

describe("billingPeriodToTimestampRange", () => {
  it("exposes inclusive start + exclusive end-of-day", () => {
    const period = previousBillingPeriod("monthly", new Date("2026-04-17T12:00:00Z"));
    const range = billingPeriodToTimestampRange(period);
    expect(range.startIso).toBe("2026-03-01T00:00:00.000Z");
    expect(range.endExclusiveIso).toBe("2026-04-01T00:00:00.000Z");
  });
});
