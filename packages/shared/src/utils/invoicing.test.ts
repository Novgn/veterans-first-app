import { describe, expect, it } from "vitest";

import {
  buildInvoiceNumber,
  computeDueDate,
  computeInvoiceTotals,
  formatInvoiceDate,
} from "./invoicing";

describe("formatInvoiceDate", () => {
  it("formats to YYYYMMDD in UTC", () => {
    expect(formatInvoiceDate(new Date("2026-04-17T12:00:00Z"))).toBe("20260417");
    expect(formatInvoiceDate(new Date("2026-01-05T00:00:00Z"))).toBe("20260105");
  });
});

describe("buildInvoiceNumber", () => {
  it("zero-pads the sequence to four digits", () => {
    expect(buildInvoiceNumber(new Date("2026-04-17T00:00:00Z"), 1)).toBe("INV-20260417-0001");
    expect(buildInvoiceNumber(new Date("2026-04-17T00:00:00Z"), 27)).toBe("INV-20260417-0027");
  });

  it("handles large sequences without truncation", () => {
    expect(buildInvoiceNumber(new Date("2026-04-17T00:00:00Z"), 12345)).toBe("INV-20260417-12345");
  });
});

describe("computeInvoiceTotals", () => {
  it("defaults tax to zero", () => {
    expect(computeInvoiceTotals(1500)).toEqual({
      amountCents: 1500,
      taxCents: 0,
      totalCents: 1500,
    });
  });

  it("adds tax to amount", () => {
    expect(computeInvoiceTotals(1500, 120)).toEqual({
      amountCents: 1500,
      taxCents: 120,
      totalCents: 1620,
    });
  });
});

describe("computeDueDate", () => {
  it("adds 14 days by default", () => {
    expect(computeDueDate(new Date("2026-04-17T00:00:00Z"))).toBe("2026-05-01");
  });

  it("accepts custom term days", () => {
    expect(computeDueDate(new Date("2026-04-17T00:00:00Z"), 30)).toBe("2026-05-17");
  });
});
