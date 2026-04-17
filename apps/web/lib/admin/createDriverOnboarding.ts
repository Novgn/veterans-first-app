'use server';

/**
 * Driver onboarding server action (Story 5.3).
 *
 * Validates the admin "Add Driver" form, creates a Clerk invitation with
 * the `driver` role, and writes driver_profiles + driver_credentials
 * rows. Succeeds by redirecting to /admin/drivers. Fails by redirecting
 * back to /admin/drivers/new?error=… so the admin can retry.
 */

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';

import { validateDriverOnboarding } from '@veterans-first/shared/utils';

import { getCurrentUserWithRole } from '@/lib/auth/current-user';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

function buildRedirectError(message: string): never {
  redirect(`/admin/drivers/new?error=${encodeURIComponent(message)}`);
}

export async function createDriverOnboarding(formData: FormData): Promise<void> {
  const user = await getCurrentUserWithRole();
  if (!user || user.role !== 'admin') {
    buildRedirectError('Only admins can add drivers.');
  }

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === 'string' ? v : '';
  };

  const validation = validateDriverOnboarding({
    firstName: str('firstName'),
    lastName: str('lastName'),
    phone: str('phone'),
    email: str('email') || null,
    vehicleMake: str('vehicleMake'),
    vehicleModel: str('vehicleModel'),
    vehicleYear: str('vehicleYear') || null,
    vehicleColor: str('vehicleColor'),
    vehiclePlate: str('vehiclePlate'),
    yearsExperience: str('yearsExperience') || null,
    licenseUrl: str('licenseUrl') || null,
    licenseNumber: str('licenseNumber') || null,
    licenseExpiration: str('licenseExpiration') || null,
    insuranceUrl: str('insuranceUrl') || null,
    insuranceExpiration: str('insuranceExpiration') || null,
    backgroundCheckUrl: str('backgroundCheckUrl') || null,
  });

  if (!validation.ok) {
    const first = validation.errors[0];
    buildRedirectError(first?.message ?? 'Validation failed.');
  }

  const data = validation.value;

  let clerkUserId: string;
  try {
    const client = await clerkClient();
    const invitation = await client.invitations.createInvitation({
      emailAddress: data.email ?? `${data.phone.replace(/\D/g, '')}@driver.placeholder`,
      publicMetadata: { role: 'driver' },
      notify: Boolean(data.email),
    });
    clerkUserId = invitation.id;
  } catch (err) {
    log.error(
      { event: 'admin.driver.onboard.clerkFail', errMsg: (err as Error).message.length },
      'clerk invitation failed',
    );
    buildRedirectError('Could not create Clerk invitation. Check the phone/email and retry.');
  }

  const supabase = getServiceRoleSupabase();

  // Upsert the users row — the Clerk webhook will hydrate metadata when
  // the invite is accepted. Using invitation id as clerk_id placeholder
  // until the user completes signup, then the webhook switches it to the
  // real Clerk user id by phone match.
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkUserId,
      phone: data.phone,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      role: 'driver',
    })
    .select('id')
    .single();

  if (userErr || !userRow) {
    log.error({ event: 'admin.driver.onboard.userInsertFail' }, 'users insert failed');
    buildRedirectError('Could not save driver record. Check that the phone number is unique.');
  }

  const driverUserId = (userRow as { id: string }).id;

  const { error: profileErr } = await supabase.from('driver_profiles').insert({
    user_id: driverUserId,
    vehicle_make: data.vehicle.make,
    vehicle_model: data.vehicle.model,
    vehicle_year: data.vehicle.year,
    vehicle_color: data.vehicle.color,
    vehicle_plate: data.vehicle.plate,
    years_experience: data.yearsExperience,
    is_active: false,
  });

  if (profileErr) {
    log.error({ event: 'admin.driver.onboard.profileInsertFail' }, 'profile insert failed');
    buildRedirectError('Driver created but vehicle profile failed. Reach out to engineering.');
  }

  if (data.credentials.length > 0) {
    await supabase.from('driver_credentials').insert(
      data.credentials.map((c) => ({
        driver_id: driverUserId,
        credential_type: c.credentialType,
        credential_number: c.credentialNumber,
        expiration_date: c.expirationDate,
        document_url: c.documentUrl,
        verification_status: 'pending',
      })),
    );
  }

  const actor = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.clerkUserId)
    .maybeSingle();
  const actorId = (actor.data as { id: string } | null)?.id ?? null;

  await supabase.from('audit_logs').insert({
    user_id: actorId,
    action: 'driver_onboarded',
    resource_type: 'driver_profiles',
    resource_id: driverUserId,
    new_values: {
      phone: data.phone,
      credentialsCount: data.credentials.length,
    },
  });

  revalidatePath('/admin/drivers');
  redirect(`/admin/drivers/${driverUserId}`);
}
