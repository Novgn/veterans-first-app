'use server';

/**
 * Operating hours save action (Story 5.15).
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { DAY_KEYS, parseOperatingHoursForm, type DayKey } from '@veterans-first/shared/utils';

import { upsertSystemConfig } from '@/lib/admin/saveSystemConfig';

export async function saveOperatingHours(formData: FormData): Promise<void> {
  const days = Object.fromEntries(
    DAY_KEYS.map((day) => {
      return [
        day,
        {
          open: String(formData.get(`${day}-open`) ?? ''),
          close: String(formData.get(`${day}-close`) ?? ''),
          enabled: formData.get(`${day}-enabled`) === 'on',
        },
      ];
    }),
  ) as Record<DayKey, { open: string; close: string; enabled: boolean }>;

  const closures = String(formData.get('closures') ?? '');
  const parsed = parseOperatingHoursForm({ days, closures });
  if (!parsed.ok) {
    redirect(
      `/admin/configuration/operating-hours?error=${parsed.reason}${
        parsed.day ? `:${parsed.day}` : ''
      }`,
    );
  }

  const jsonSafe: Record<string, unknown> = { holidays: parsed.config.closures };
  for (const day of DAY_KEYS) {
    jsonSafe[day] = parsed.config.days[day];
  }

  const result = await upsertSystemConfig('operating_hours', jsonSafe);
  if (!result.ok) {
    redirect(`/admin/configuration/operating-hours?error=${result.reason ?? 'save-failed'}`);
  }
  revalidatePath('/admin/configuration/operating-hours');
  redirect('/admin/configuration/operating-hours?ok=1');
}
