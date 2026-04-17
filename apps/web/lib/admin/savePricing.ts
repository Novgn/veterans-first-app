'use server';

/**
 * Pricing config save action (Story 5.14).
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { parsePricingForm } from '@veterans-first/shared/utils';

import { upsertSystemConfig } from '@/lib/admin/saveSystemConfig';

export async function savePricing(formData: FormData): Promise<void> {
  const input = {
    baseDollars: String(formData.get('baseDollars') ?? ''),
    perMileDollars: String(formData.get('perMileDollars') ?? ''),
    perWaitMinuteDollars: String(formData.get('perWaitMinuteDollars') ?? ''),
    includedWaitMinutes: String(formData.get('includedWaitMinutes') ?? ''),
    minimumFareDollars: String(formData.get('minimumFareDollars') ?? ''),
  };

  const parsed = parsePricingForm(input);
  if (!parsed.ok) {
    redirect(`/admin/configuration/pricing?error=${parsed.reason}:${parsed.field ?? 'unknown'}`);
  }

  const result = await upsertSystemConfig('pricing', {
    base_cents: parsed.pricing.baseCents,
    per_mile_cents: parsed.pricing.perMileCents,
    per_wait_minute_cents: parsed.pricing.perWaitMinuteCents,
    included_wait_minutes: parsed.pricing.includedWaitMinutes,
    minimum_fare_cents: parsed.pricing.minimumFareCents,
  });

  if (!result.ok) {
    redirect(`/admin/configuration/pricing?error=${result.reason ?? 'save-failed'}`);
  }

  revalidatePath('/admin/configuration/pricing');
  redirect('/admin/configuration/pricing?ok=1');
}
