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
        <Link href="/admin/configuration" className="text-sm text-blue-600 hover:underline">
          ← Configuration
        </Link>
        <h2 className="mt-1 text-lg font-semibold">Operating hours</h2>
        <p className="text-sm text-zinc-600">
          Configure the days and hours when rides can be booked, plus holiday closures.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
          Operating hours saved.
        </div>
      ) : null}

      <form action={saveOperatingHours} className="space-y-4">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-3 py-2">Day</th>
              <th className="px-3 py-2">Open</th>
              <th className="px-3 py-2">Close</th>
              <th className="px-3 py-2">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {DAY_KEYS.map((day) => {
              const window = config.days[day];
              const open = window?.open ?? '06:00';
              const close = window?.close ?? '20:00';
              return (
                <tr key={day} className="border-t border-zinc-100">
                  <td className="px-3 py-2">{DAY_LABELS[day]}</td>
                  <td className="px-3 py-2">
                    <input
                      name={`${day}-open`}
                      type="time"
                      defaultValue={open}
                      className="h-9 rounded-md border border-zinc-300 px-2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name={`${day}-close`}
                      type="time"
                      defaultValue={close}
                      className="h-9 rounded-md border border-zinc-300 px-2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      name={`${day}-enabled`}
                      type="checkbox"
                      defaultChecked={window !== null}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-zinc-700">
            Closure dates (one per line, YYYY-MM-DD)
          </span>
          <textarea
            name="closures"
            rows={5}
            defaultValue={config.closures.join('\n')}
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            Save operating hours
          </button>
        </div>
      </form>
    </div>
  );
}
