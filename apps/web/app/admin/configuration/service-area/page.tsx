/**
 * Service area configuration (Story 5.13).
 */

import Link from 'next/link';

import { parseServiceAreaPolygon, type ServiceAreaPolygon } from '@veterans-first/shared/utils';

import { saveServiceArea } from '@/lib/admin/saveServiceArea';
import { readSystemConfig } from '@/lib/admin/saveSystemConfig';

export const dynamic = 'force-dynamic';

export default async function ServiceAreaPage(props: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await props.searchParams;
  const current = await readSystemConfig<unknown>('service_area', {
    type: 'Polygon',
    coordinates: [],
  });
  const parsed = parseServiceAreaPolygon(JSON.stringify(current));
  const polygon: ServiceAreaPolygon = parsed.ok ? parsed.polygon : [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/configuration" className="text-sm text-blue-600 hover:underline">
          ← Configuration
        </Link>
        <h2 className="mt-1 text-lg font-semibold">Service area</h2>
        <p className="text-sm text-zinc-600">
          Define the operating polygon as a list of lat/lng vertices or GeoJSON Polygon. Leave empty
          for no restriction.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
          Service area saved.
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Current vertices ({polygon.length})</h3>
        {polygon.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No restriction configured — bookings allowed anywhere.
          </p>
        ) : (
          <ol className="list-decimal pl-6 text-sm">
            {polygon.map((v, i) => (
              <li key={`${v.lat}-${v.lng}-${i}`}>
                lat {v.lat.toFixed(6)}, lng {v.lng.toFixed(6)}
              </li>
            ))}
          </ol>
        )}
      </section>

      <form action={saveServiceArea} className="space-y-2">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-zinc-700">New polygon (JSON)</span>
          <textarea
            name="polygonJson"
            rows={10}
            defaultValue={JSON.stringify(current, null, 2)}
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs"
            required
          />
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Save service area
        </button>
      </form>
    </div>
  );
}
