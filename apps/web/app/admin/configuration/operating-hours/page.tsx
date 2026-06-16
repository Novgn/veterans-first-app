/**
 * Operating hours configuration (Story 5.15).
 */

import Link from 'next/link';

import {
  DAY_KEYS,
  DEFAULT_OPERATING_HOURS,
  type DayKey,
  type OperatingHoursConfig,
} from '@veterans-first/shared/utils';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { readSystemConfig } from '@/lib/admin/saveSystemConfig';
import { saveOperatingHours } from '@/lib/admin/saveOperatingHours';

export const dynamic = 'force-dynamic';

interface RawOperatingHours {
  holidays?: string[];
  [key: string]: unknown;
}

function toConfig(raw: RawOperatingHours | null): OperatingHoursConfig {
  if (!raw) return DEFAULT_OPERATING_HOURS;
  const days = {} as Record<DayKey, OperatingHoursConfig['days'][DayKey]>;
  for (const day of DAY_KEYS) {
    const window = raw[day];
    if (window && typeof window === 'object') {
      const w = window as { open?: unknown; close?: unknown };
      if (typeof w.open === 'string' && typeof w.close === 'string') {
        days[day] = { open: w.open, close: w.close };
        continue;
      }
    }
    days[day] = null;
  }
  return { days, closures: raw.holidays ?? [] };
}

const DAY_LABELS: Record<DayKey, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

export default async function OperatingHoursPage(props: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await props.searchParams;
  const raw = await readSystemConfig<RawOperatingHours | null>('operating_hours', null);
  const config = toConfig(raw);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/configuration"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← Settings
        </Link>
        <h2 className="mt-2 text-title-2 font-semibold text-ink">Operating hours</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Configure the days and hours when rides can be booked, plus holiday exceptions.
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

      <form action={saveOperatingHours} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily hours</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-border-hairline text-left text-caption font-semibold text-ink-secondary">
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Open</th>
                  <th className="px-3 py-2">Close</th>
                  <th className="px-3 py-2">Open for bookings</th>
                </tr>
              </thead>
              <tbody>
                {DAY_KEYS.map((day) => {
                  const window = config.days[day];
                  const open = window?.open ?? '06:00';
                  const close = window?.close ?? '20:00';
                  return (
                    <tr key={day} className="border-b border-border-hairline last:border-0">
                      <td className="px-3 py-3 font-semibold text-ink">{DAY_LABELS[day]}</td>
                      <td className="px-3 py-3">
                        <input
                          name={`${day}-open`}
                          type="time"
                          defaultValue={open}
                          className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          name={`${day}-close`}
                          type="time"
                          defaultValue={close}
                          className="h-12 rounded-sm border border-border-strong bg-card px-3 text-body text-ink"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          name={`${day}-enabled`}
                          type="checkbox"
                          defaultChecked={window !== null}
                          className="h-5 w-5 accent-navy"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Holiday exceptions</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="closures" className="mb-2 block text-callout font-semibold text-ink">
              Closure dates{' '}
              <span className="font-normal text-ink-secondary">(one per line, YYYY-MM-DD)</span>
            </label>
            <textarea
              id="closures"
              name="closures"
              rows={5}
              defaultValue={config.closures.join('\n')}
              className="w-full rounded-sm border border-border-strong bg-card px-4 py-3 font-mono text-callout text-ink"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
