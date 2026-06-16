/**
 * Service area configuration (Story 5.13).
 */

import Link from 'next/link';

import { parseServiceAreaPolygon, type ServiceAreaPolygon } from '@veterans-first/shared/utils';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
        <Link
          href="/admin/configuration"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← Settings
        </Link>
        <h2 className="mt-2 text-title-2 font-semibold text-ink">Service area</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Define the operating polygon as a list of lat/lng vertices or GeoJSON Polygon. Leave empty
          for no restriction.
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
          <CardTitle>Current vertices ({polygon.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {polygon.length === 0 ? (
            <p className="text-body text-ink-secondary">
              No restriction configured — bookings allowed anywhere.
            </p>
          ) : (
            <ol className="list-decimal space-y-1 pl-6 text-body text-ink">
              {polygon.map((v, i) => (
                <li key={`${v.lat}-${v.lng}-${i}`}>
                  lat {v.lat.toFixed(6)}, lng {v.lng.toFixed(6)}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update service area</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveServiceArea} className="space-y-4">
            <div>
              <label
                htmlFor="polygonJson"
                className="mb-2 block text-callout font-semibold text-ink"
              >
                New polygon (JSON)
              </label>
              <textarea
                id="polygonJson"
                name="polygonJson"
                rows={10}
                defaultValue={JSON.stringify(current, null, 2)}
                className="w-full rounded-sm border border-border-strong bg-card px-4 py-3 font-mono text-callout text-ink"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
