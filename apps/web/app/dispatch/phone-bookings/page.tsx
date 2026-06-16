/**
 * Phone Bookings (Story 3.15)
 *
 * Dispatcher creates a ride on behalf of a rider who called in. Pick an
 * existing rider (search by name/phone) and fill pickup, dropoff, and
 * scheduled time. Status starts as `pending`, ready to be assigned.
 */

import { revalidatePath } from 'next/cache';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RiderOption {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

async function fetchRiders(): Promise<RiderOption[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone')
      .eq('role', 'rider')
      .order('last_name', { ascending: true });
    return (data as RiderOption[] | null) ?? [];
  } catch {
    return [];
  }
}

async function createPhoneBookingAction(formData: FormData): Promise<void> {
  'use server';
  const riderId = String(formData.get('riderId') ?? '').trim();
  const pickupAddress = String(formData.get('pickupAddress') ?? '').trim();
  const dropoffAddress = String(formData.get('dropoffAddress') ?? '').trim();
  const scheduledPickupTime = String(formData.get('scheduledPickupTime') ?? '').trim();

  if (!riderId || !pickupAddress || !dropoffAddress || !scheduledPickupTime) {
    return;
  }

  const supabase = await getServerSupabase();
  await supabase.from('rides').insert({
    rider_id: riderId,
    status: 'pending',
    pickup_address: pickupAddress,
    dropoff_address: dropoffAddress,
    scheduled_pickup_time: new Date(scheduledPickupTime).toISOString(),
  });

  revalidatePath('/dispatch/phone-bookings');
  revalidatePath('/dispatch/assignments');
}

// Shared field styling so the native <select>, text, and datetime inputs read
// like the DS Input: 56px tall, white surface, perceivable border-strong edge,
// rounded-sm (8px). The global 4px navy focus ring (tokens.css) handles focus.
const fieldClass =
  'h-14 w-full rounded-sm border border-border-strong bg-card px-4 text-body text-ink placeholder:text-ink-secondary';
const labelClass = 'mb-2 block text-callout font-semibold text-ink';

export default async function PhoneBookingsPage() {
  const riders = await fetchRiders();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">New Phone Booking</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Look up the caller, pre-fill the ride, and book it. It lands in Assignments as Pending.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ride details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPhoneBookingAction} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="riderId" className={labelClass}>
                Rider
              </label>
              <select id="riderId" name="riderId" required className={fieldClass}>
                <option value="">Look up caller by phone or name…</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.last_name}, {r.first_name} — {r.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pickupAddress" className={labelClass}>
                Pickup address
              </label>
              <input id="pickupAddress" name="pickupAddress" required className={fieldClass} />
            </div>

            <div>
              <label htmlFor="dropoffAddress" className={labelClass}>
                Dropoff address
              </label>
              <input id="dropoffAddress" name="dropoffAddress" required className={fieldClass} />
            </div>

            <div>
              <label htmlFor="scheduledPickupTime" className={labelClass}>
                Scheduled pickup time
              </label>
              <input
                id="scheduledPickupTime"
                name="scheduledPickupTime"
                type="datetime-local"
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="referralSource" className={labelClass}>
                Referral source <span className="font-normal text-ink-secondary">(optional)</span>
              </label>
              <select id="referralSource" name="referralSource" className={fieldClass}>
                <option value="">Select referral source…</option>
                <option value="partner_clinic">Partner clinic</option>
                <option value="va">VA</option>
                <option value="hospital_discharge">Hospital discharge</option>
                <option value="self">Self</option>
                <option value="family">Family</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Book This Ride
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
