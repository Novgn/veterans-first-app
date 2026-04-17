/**
 * Pricing config + fare calculation — Story 5.14
 *
 * Pure types + math so the booking flow (server-side) and the admin
 * preview (web) share one fare function.
 */

export interface PricingConfig {
  baseCents: number;
  perMileCents: number;
  perWaitMinuteCents: number;
  includedWaitMinutes: number;
  minimumFareCents: number;
}

export const DEFAULT_PRICING: PricingConfig = {
  baseCents: 500,
  perMileCents: 150,
  perWaitMinuteCents: 25,
  includedWaitMinutes: 20,
  minimumFareCents: 1000,
};

export interface RideFareInput {
  miles: number;
  waitMinutes: number;
}

export function computeRideFareCents(input: RideFareInput, pricing: PricingConfig): number {
  const miles = Math.max(0, input.miles);
  const waitMinutes = Math.max(0, input.waitMinutes);
  const waitOverage = Math.max(0, waitMinutes - pricing.includedWaitMinutes);
  const raw =
    pricing.baseCents +
    Math.round(miles * pricing.perMileCents) +
    waitOverage * pricing.perWaitMinuteCents;
  return Math.max(pricing.minimumFareCents, raw);
}

export type PricingParseResult =
  | { ok: true; pricing: PricingConfig }
  | { ok: false; reason: string; field?: keyof PricingConfig };

function toCents(raw: string, field: keyof PricingConfig): number | PricingParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "missing", field };
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value) || value < 0) return { ok: false, reason: "invalid", field };
  return Math.round(value * 100);
}

function toInt(raw: string, field: keyof PricingConfig): number | PricingParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "missing", field };
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value < 0) return { ok: false, reason: "invalid", field };
  return value;
}

export function parsePricingForm(input: {
  baseDollars: string;
  perMileDollars: string;
  perWaitMinuteDollars: string;
  includedWaitMinutes: string;
  minimumFareDollars: string;
}): PricingParseResult {
  const base = toCents(input.baseDollars, "baseCents");
  if (typeof base !== "number") return base;
  const mile = toCents(input.perMileDollars, "perMileCents");
  if (typeof mile !== "number") return mile;
  const wait = toCents(input.perWaitMinuteDollars, "perWaitMinuteCents");
  if (typeof wait !== "number") return wait;
  const min = toCents(input.minimumFareDollars, "minimumFareCents");
  if (typeof min !== "number") return min;
  const included = toInt(input.includedWaitMinutes, "includedWaitMinutes");
  if (typeof included !== "number") return included;

  return {
    ok: true,
    pricing: {
      baseCents: base,
      perMileCents: mile,
      perWaitMinuteCents: wait,
      includedWaitMinutes: included,
      minimumFareCents: min,
    },
  };
}
