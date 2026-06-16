/**
 * Pricing configuration (Story 5.14).
 */

import Link from 'next/link';

import {
  DEFAULT_PRICING,
  computeRideFareCents,
  type PricingConfig,
} from '@veterans-first/shared/utils';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
        <Link
          href="/admin/configuration"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← Settings
        </Link>
        <h2 className="mt-2 text-title-2 font-semibold text-ink">Pricing</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Pricing takes effect immediately for new bookings. No surge — price stays locked for
          existing bookings.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-md border border-error bg-error-100 p-4 text-body text-ink"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {ok ? (
        <div
          className="rounded-md border border-success bg-success-100 p-4 text-body text-ink"
          role="status"
          aria-live="polite"
        >
          Changes saved.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Fare configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={savePricing} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field
              label="Base fare ($)"
              name="baseDollars"
              defaultValue={(current.baseCents / 100).toFixed(2)}
            />
            <Field
              label="Per-mile rate ($)"
              name="perMileDollars"
              defaultValue={(current.perMileCents / 100).toFixed(2)}
            />
            <Field
              label="Per wait minute ($)"
              name="perWaitMinuteDollars"
              defaultValue={(current.perWaitMinuteCents / 100).toFixed(2)}
            />
            <Field
              label="Included wait time (minutes)"
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
            <div className="flex items-end justify-end sm:col-span-2">
              <Button type="submit" size="lg">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample fares</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border-hairline text-body">
            {samples.map((s) => (
              <li key={s.label} className="flex justify-between py-3">
                <span className="text-ink-secondary">{s.label}</span>
                <span className="font-semibold text-ink">
                  {formatMoneyCents(computeRideFareCents(s, current))}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
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
    <Input
      label={label}
      name={name}
      type="number"
      step={step}
      min={min}
      defaultValue={defaultValue}
      required
    />
  );
}
