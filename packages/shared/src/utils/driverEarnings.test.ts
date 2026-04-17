import { describe, expect, it } from "vitest";

import { aggregateEarnings, computeEarnings } from "./driverEarnings";

describe("computeEarnings", () => {
  it("defaults to 20 percent fee", () => {
    expect(computeEarnings(5000)).toEqual({
      grossCents: 5000,
      companyFeeCents: 1000,
      netCents: 4000,
    });
  });

  it("supports custom fee rate", () => {
    expect(computeEarnings(2500, 0.15)).toEqual({
      grossCents: 2500,
      companyFeeCents: 375,
      netCents: 2125,
    });
  });

  it("handles zero and negative fares safely", () => {
    expect(computeEarnings(0)).toEqual({
      grossCents: 0,
      companyFeeCents: 0,
      netCents: 0,
    });
    expect(computeEarnings(-50)).toEqual({
      grossCents: 0,
      companyFeeCents: 0,
      netCents: 0,
    });
  });

  it("clamps fee rate to [0,1]", () => {
    expect(computeEarnings(1000, 2).companyFeeCents).toBe(1000);
    expect(computeEarnings(1000, -0.2).companyFeeCents).toBe(0);
  });
});

describe("aggregateEarnings", () => {
  it("sums rows and counts them", () => {
    expect(
      aggregateEarnings([
        { grossAmountCents: 5000, companyFeeCents: 1000, netAmountCents: 4000 },
        { grossAmountCents: 2500, companyFeeCents: 500, netAmountCents: 2000 },
      ])
    ).toEqual({
      grossCents: 7500,
      companyFeeCents: 1500,
      netCents: 6000,
      count: 2,
    });
  });
});
