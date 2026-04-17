'use server';

/**
 * Service area save action (Story 5.13).
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { parseServiceAreaPolygon } from '@veterans-first/shared/utils';

import { upsertSystemConfig } from '@/lib/admin/saveSystemConfig';

export async function saveServiceArea(formData: FormData): Promise<void> {
  const raw = String(formData.get('polygonJson') ?? '');
  const parsed = parseServiceAreaPolygon(raw);
  if (!parsed.ok) {
    redirect(`/admin/configuration/service-area?error=${parsed.reason}`);
  }

  const configValue =
    parsed.polygon.length === 0
      ? { type: 'Polygon', coordinates: [] }
      : {
          type: 'Polygon',
          coordinates: [parsed.polygon.map((v) => [v.lng, v.lat])],
        };

  const result = await upsertSystemConfig(
    'service_area',
    configValue,
    'GeoJSON polygon defining the service area (Story 5.13).',
  );
  if (!result.ok) {
    redirect(`/admin/configuration/service-area?error=${result.reason ?? 'save-failed'}`);
  }
  revalidatePath('/admin/configuration/service-area');
  redirect('/admin/configuration/service-area?ok=1');
}
