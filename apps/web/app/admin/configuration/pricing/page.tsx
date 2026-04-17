/**
 * Pricing configuration (Story 5.14).
 */

import Link from 'next/link';

import {
  DEFAULT_PRICING,
  computeRideFareCents,
  type PricingConfig,
} from '@veterans-first/shared/utils';

import { formatMoneyCents } from '@/lib/format';
import { readSystemConfig } from '@/lib/admin/saveSystemConfig';
import { savePricing } from '@/lib/admin/savePricing';

export const dynamic = 'force-dynamic';

interface PricingConfigJson {
  base_cents: number;
  per_mile_cents: number;
  per_wait_minute_cents: number;
  included_wait_minutes: number;
  minimum_fare_cents: number;
}

function toConfig(json: Partial<PricingConfigJson> | null): PricingConfig {
  return {
    baseCents: json?.base_cents ?? DEFAULT_PRICING.baseCents,
    perMileCents: json?.per_mile_cents ?? DEFAULT_PRICING.perMileCents,
    perWaitMinuteCents: json?.per_wait_minute_cents ?? DEFAULT_PRICING.perWaitMinuteCents,
    includedWaitMinutes: json?.included_wait_minutes ?? DEFAULT_PRICING.includedWaitMinutes,
    minimumFareCents: json?.minimum_fare_cents ?? DEFAULT_PRICING.minimumFareCents,
  };
}

export default async function PricingPage(props: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await props.searchParams;
  const raw = await readSystemConfig<Partial<PricingConfigJson> | null>('pricing', null);
  const current = toConfig(raw);
  const samples = [
    { miles: 3, waitMinutes: 10, label: '3 mi, 10 min wait' },
    { miles: 7, waitMinutes: 25, label: '7 mi, 25 min wait' },
    { miles: 12, waitMinutes: 45, label: '12 mi, 45 min wait' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/configuration" className="text-sm text-blue-600 hover:underline">
          ← Configuration
        </Link>
        <h2 className="mt-1 text-lg font-semibold">Pricing</h2>
        <p className="text-sm text-zinc-600">
          Pricing takes effect immediately for new bookings. Existing booked rides keep the fare
          locked at booking time.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
          Pricing saved.
        </div>
      ) : null}

      <form action={savePricing} className="grid grid-cols-2 gap-3">
        <Field
          label="Base rate ($)"
          name="baseDollars"
          defaultValue={(current.baseCents / 100).toFixed(2)}
        />
        <Field
          label="Per mile ($)"
          name="perMileDollars"
          defaultValue={(current.perMileCents / 100).toFixed(2)}
        />
        <Field
          label="Per wait minute ($)"
          name="perWaitMinuteDollars"
          defaultValue={(current.perWaitMinuteCents / 100).toFixed(2)}
        />
        <Field
          label="Included wait minutes"
          name="includedWaitMinutes"
          defaultValue={current.includedWaitMinutes.toString()}
          step="1"
          min="0"
        />
        <Field
          label="Minimum fare ($)"
          name="minimumFareDollars"
          defaultValue={(current.minimumFareCents / 100).toFixed(2)}
        />
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            Save pricing
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Sample fares</h3>
        <ul className="divide-y divide-zinc-100 text-sm">
          {samples.map((s) => (
            <li key={s.label} className="flex justify-between py-2">
              <span>{s.label}</span>
              <span>{formatMoneyCents(computeRideFareCents(s, current))}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  defaultValue: string;
  step?: string;
  min?: string;
}

function Field({ label, name, defaultValue, step = '0.01', min = '0' }: FieldProps) {
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        type="number"
        step={step}
        min={min}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-zinc-300 px-3"
        required
      />
    </label>
  );
}
