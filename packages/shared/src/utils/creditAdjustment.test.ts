import { describe, expect, it } from "vitest";

import { applyCreditDelta, validateAdminCreditInput } from "./creditAdjustment";

describe("applyCreditDelta", () => {
  it("adds positive delta to balance", () => {
    expect(applyCreditDelta({ currentBalanceCents: 500, deltaCents: 300 })).toEqual({
      nextBalanceCents: 800,
      appliedDeltaCents: 300,
    });
  });

  it("consumes credit for negative delta", () => {
    expect(applyCreditDelta({ currentBalanceCents: 500, deltaCents: -200 })).toEqual({
      nextBalanceCents: 300,
      appliedDeltaCents: -200,
    });
  });

  it("floors balance at zero and reports effective delta", () => {
    expect(applyCreditDelta({ currentBalanceCents: 100, deltaCents: -500 })).toEqual({
      nextBalanceCents: 0,
      appliedDeltaCents: -100,
    });
  });
});

describe("validateAdminCreditInput", () => {
  it("accepts dollar amount and converts to cents", () => {
    const result = validateAdminCreditInput("12.50");
    expect(result).toEqual({ ok: true, cents: 1250 });
  });

  it("rejects non-numeric input", () => {
    const result = validateAdminCreditInput("abc");
    expect(result.ok).toBe(false);
  });

  it("rejects non-positive amounts", () => {
    expect(validateAdminCreditInput("0").ok).toBe(false);
    expect(validateAdminCreditInput("-5").ok).toBe(false);
  });

  it("caps at $100,000", () => {
    const result = validateAdminCreditInput("999999");
    expect(result.ok).toBe(false);
  });
});
