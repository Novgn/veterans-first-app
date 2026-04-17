import { describe, expect, it } from "vitest";

import { DEFAULT_PRICING, computeRideFareCents, parsePricingForm } from "./pricing";

describe("computeRideFareCents", () => {
  it("charges base + mileage when wait stays under included window", () => {
    expect(computeRideFareCents({ miles: 5, waitMinutes: 10 }, DEFAULT_PRICING)).toBe(
      500 + 5 * 150
    );
  });

  it("charges wait overage once included window is exceeded", () => {
    expect(computeRideFareCents({ miles: 5, waitMinutes: 30 }, DEFAULT_PRICING)).toBe(
      500 + 5 * 150 + 10 * 25
    );
  });

  it("applies minimum fare when computed total is smaller", () => {
    expect(computeRideFareCents({ miles: 0.5, waitMinutes: 0 }, DEFAULT_PRICING)).toBe(
      DEFAULT_PRICING.minimumFareCents
    );
  });

  it("rejects negative wait/miles", () => {
    expect(computeRideFareCents({ miles: -5, waitMinutes: -10 }, DEFAULT_PRICING)).toBe(
      DEFAULT_PRICING.minimumFareCents
    );
  });
});

describe("parsePricingForm", () => {
  it("converts dollar inputs to cents", () => {
    const result = parsePricingForm({
      baseDollars: "7.50",
      perMileDollars: "1.25",
      perWaitMinuteDollars: "0.30",
      includedWaitMinutes: "15",
      minimumFareDollars: "12",
    });
    expect(result).toEqual({
      ok: true,
      pricing: {
        baseCents: 750,
        perMileCents: 125,
        perWaitMinuteCents: 30,
        includedWaitMinutes: 15,
        minimumFareCents: 1200,
      },
    });
  });

  it("rejects negative values", () => {
    const result = parsePricingForm({
      baseDollars: "-1",
      perMileDollars: "1",
      perWaitMinuteDollars: "1",
      includedWaitMinutes: "20",
      minimumFareDollars: "10",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty values", () => {
    const result = parsePricingForm({
      baseDollars: "",
      perMileDollars: "1",
      perWaitMinuteDollars: "1",
      includedWaitMinutes: "20",
      minimumFareDollars: "10",
    });
    expect(result.ok).toBe(false);
  });
});
