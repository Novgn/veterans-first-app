import { describe, expect, it } from "vitest";

import { buildChargeInput } from "./paymentCharging";

const baseInvoice = {
  id: "inv_1",
  riderId: "r_1",
  totalCents: 2500,
  status: "pending",
  billingPeriod: "per_ride",
};

const baseAccount = {
  stripeCustomerId: "cus_123",
  defaultPaymentMethodId: "pm_456",
  autopayEnabled: true,
  creditBalanceCents: 0,
};

describe("buildChargeInput", () => {
  it("returns charge for pending invoice with full setup", () => {
    const result = buildChargeInput(baseInvoice, baseAccount);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.charge.amountCents).toBe(2500);
    expect(result.charge.paymentMethodId).toBe("pm_456");
  });

  it("skips when autopay disabled", () => {
    const result = buildChargeInput(baseInvoice, { ...baseAccount, autopayEnabled: false });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("autopay-disabled");
  });

  it("skips when no default payment method", () => {
    const result = buildChargeInput(baseInvoice, {
      ...baseAccount,
      defaultPaymentMethodId: null,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("no-default-payment-method");
  });

  it("skips cancelled invoices", () => {
    const result = buildChargeInput({ ...baseInvoice, status: "cancelled" }, baseAccount);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("invoice-cancelled");
  });

  it("subtracts credit balance from charge amount", () => {
    const result = buildChargeInput(baseInvoice, { ...baseAccount, creditBalanceCents: 500 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.charge.amountCents).toBe(2000);
  });

  it("skips when credit balance fully covers invoice", () => {
    const result = buildChargeInput(baseInvoice, { ...baseAccount, creditBalanceCents: 3000 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("amount-zero-or-negative");
  });
});
