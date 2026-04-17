/**
 * Rider credit adjustments — Story 5.7
 *
 * Pure math for updating a rider's credit balance. Admin applies
 * positive credits; billing internals apply negative deltas (consume
 * credit). Balance is floored at zero so rounding edge cases can't
 * send it negative.
 */

export interface CreditAdjustmentInput {
  currentBalanceCents: number;
  deltaCents: number;
}

export interface CreditAdjustmentResult {
  nextBalanceCents: number;
  appliedDeltaCents: number;
}

export function applyCreditDelta(input: CreditAdjustmentInput): CreditAdjustmentResult {
  const next = input.currentBalanceCents + input.deltaCents;
  if (next < 0) {
    // Caller asked to consume more credit than exists. Consume what we
    // have, leaving balance at zero.
    return {
      nextBalanceCents: 0,
      appliedDeltaCents: -input.currentBalanceCents,
    };
  }
  return {
    nextBalanceCents: next,
    appliedDeltaCents: input.deltaCents,
  };
}

export function validateAdminCreditInput(
  raw: string
): { ok: true; cents: number } | { ok: false; reason: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "amount-required" };
  const value = Number.parseFloat(trimmed);
  if (Number.isNaN(value)) return { ok: false, reason: "amount-not-a-number" };
  if (value <= 0) return { ok: false, reason: "amount-must-be-positive" };
  const cents = Math.round(value * 100);
  if (cents > 100_000_00) return { ok: false, reason: "amount-too-large" };
  return { ok: true, cents };
}
