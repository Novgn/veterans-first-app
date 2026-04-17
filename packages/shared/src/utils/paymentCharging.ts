/**
 * Payment charging helpers — Story 5.5
 *
 * Pure validator that decides whether an invoice is chargeable given
 * the linked rider payment account. The server-side action calls this
 * first, then hands the returned `charge` payload to the Stripe client.
 */

export interface InvoiceForCharge {
  id: string;
  riderId: string;
  totalCents: number;
  status: string;
  billingPeriod: string;
}

export interface PaymentAccountForCharge {
  stripeCustomerId: string | null;
  defaultPaymentMethodId: string | null;
  autopayEnabled: boolean;
  creditBalanceCents: number;
}

export interface ChargeInput {
  invoiceId: string;
  riderId: string;
  stripeCustomerId: string;
  paymentMethodId: string;
  amountCents: number;
  description: string;
}

export type ChargeSkipReason =
  | "invoice-not-pending"
  | "invoice-cancelled"
  | "no-stripe-customer"
  | "no-default-payment-method"
  | "autopay-disabled"
  | "amount-zero-or-negative";

export type BuildChargeResult =
  | { ok: true; charge: ChargeInput }
  | { ok: false; reason: ChargeSkipReason };

export function buildChargeInput(
  invoice: InvoiceForCharge,
  account: PaymentAccountForCharge
): BuildChargeResult {
  if (invoice.status === "cancelled") {
    return { ok: false, reason: "invoice-cancelled" };
  }
  if (invoice.status !== "pending" && invoice.status !== "overdue") {
    return { ok: false, reason: "invoice-not-pending" };
  }

  if (invoice.totalCents <= 0) {
    return { ok: false, reason: "amount-zero-or-negative" };
  }

  if (!account.autopayEnabled) {
    return { ok: false, reason: "autopay-disabled" };
  }

  if (!account.stripeCustomerId) {
    return { ok: false, reason: "no-stripe-customer" };
  }

  if (!account.defaultPaymentMethodId) {
    return { ok: false, reason: "no-default-payment-method" };
  }

  const effectiveAmount = Math.max(0, invoice.totalCents - account.creditBalanceCents);
  if (effectiveAmount <= 0) {
    return { ok: false, reason: "amount-zero-or-negative" };
  }

  return {
    ok: true,
    charge: {
      invoiceId: invoice.id,
      riderId: invoice.riderId,
      stripeCustomerId: account.stripeCustomerId,
      paymentMethodId: account.defaultPaymentMethodId,
      amountCents: effectiveAmount,
      description: `Veterans First invoice (${invoice.billingPeriod})`,
    },
  };
}
