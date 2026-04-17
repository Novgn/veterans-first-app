import { describe, expect, it } from "vitest";

import { financialWindowDelta, summarizeFinancialWindow } from "./financialReports";

describe("summarizeFinancialWindow", () => {
  it("returns zeros for empty input", () => {
    expect(summarizeFinancialWindow({ invoices: [], payments: [], earnings: [] })).toEqual({
      revenueCents: 0,
      outstandingCents: 0,
      refundsCents: 0,
      driverPayoutsPendingCents: 0,
    });
  });

  it("sums paid invoices into revenue and pending into outstanding", () => {
    const result = summarizeFinancialWindow({
      invoices: [
        { totalCents: 1000, status: "paid", createdAt: "2026-04-17T00:00:00Z" },
        { totalCents: 2500, status: "paid", createdAt: "2026-04-17T00:00:00Z" },
        {
          totalCents: 800,
          status: "pending",
          createdAt: "2026-04-17T00:00:00Z",
        },
        {
          totalCents: 500,
          status: "overdue",
          createdAt: "2026-04-17T00:00:00Z",
        },
        {
          totalCents: 250,
          status: "cancelled",
          createdAt: "2026-04-17T00:00:00Z",
        },
      ],
      payments: [],
      earnings: [],
    });
    expect(result.revenueCents).toBe(3500);
    expect(result.outstandingCents).toBe(1300);
  });

  it("counts refunded payments (prefers refundedAmountCents)", () => {
    const result = summarizeFinancialWindow({
      invoices: [],
      payments: [
        {
          amountCents: 2500,
          status: "refunded",
          createdAt: "2026-04-17T00:00:00Z",
          refundedAmountCents: 1500,
          refundedAt: "2026-04-17T00:00:00Z",
        },
        {
          amountCents: 1200,
          status: "refunded",
          createdAt: "2026-04-17T00:00:00Z",
          refundedAmountCents: null,
          refundedAt: null,
        },
        {
          amountCents: 5000,
          status: "succeeded",
          createdAt: "2026-04-17T00:00:00Z",
          refundedAmountCents: null,
          refundedAt: null,
        },
      ],
      earnings: [],
    });
    expect(result.refundsCents).toBe(1500 + 1200);
  });

  it("counts unpaid driver earnings as payouts pending", () => {
    const result = summarizeFinancialWindow({
      invoices: [],
      payments: [],
      earnings: [
        { netAmountCents: 4000, paidAt: null, createdAt: "2026-04-17T00:00:00Z" },
        {
          netAmountCents: 2000,
          paidAt: "2026-04-10T00:00:00Z",
          createdAt: "2026-04-09T00:00:00Z",
        },
      ],
    });
    expect(result.driverPayoutsPendingCents).toBe(4000);
  });
});

describe("financialWindowDelta", () => {
  it("returns null when the previous window is zero", () => {
    expect(financialWindowDelta(100, 0)).toBeNull();
  });

  it("computes percent change", () => {
    expect(financialWindowDelta(120, 100)).toBeCloseTo(0.2);
    expect(financialWindowDelta(50, 100)).toBeCloseTo(-0.5);
  });
});
