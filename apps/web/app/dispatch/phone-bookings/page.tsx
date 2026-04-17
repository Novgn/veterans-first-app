/**
 * Phone Bookings (Story 3.15)
 *
 * Dispatcher creates a ride on behalf of a rider who called in. Pick an
 * existing rider (search by name/phone) and fill pickup, dropoff, and
 * scheduled time. Status starts as `pending`, ready to be assigned.
 */

import { revalidatePath } from 'next/cache';

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

export default async function PhoneBookingsPage() {
  const riders = await fetchRiders();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">New Phone Booking</h2>
        <p className="text-sm text-zinc-600">
          Create a ride for a caller. It lands in Assignments as Pending.
        </p>
      </div>

      <form
        action={createPhoneBookingAction}
        className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label htmlFor="riderId" className="mb-1 block text-sm font-semibold">
            Rider
          </label>
          <select
            id="riderId"
            name="riderId"
            required
            className="min-h-[40px] w-full rounded-md border border-zinc-300 px-3 text-sm"
          >
            <option value="">Select rider…</option>
            {riders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.last_name}, {r.first_name} — {r.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pickupAddress" className="mb-1 block text-sm font-semibold">
            Pickup address
          </label>
          <input
            id="pickupAddress"
            name="pickupAddress"
            required
            className="min-h-[40px] w-full rounded-md border border-zinc-300 px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="dropoffAddress" className="mb-1 block text-sm font-semibold">
            Dropoff address
          </label>
          <input
            id="dropoffAddress"
            name="dropoffAddress"
            required
            className="min-h-[40px] w-full rounded-md border border-zinc-300 px-3 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="scheduledPickupTime" className="mb-1 block text-sm font-semibold">
            Scheduled pickup time
          </label>
          <input
            id="scheduledPickupTime"
            name="scheduledPickupTime"
            type="datetime-local"
            required
            className="min-h-[40px] w-full rounded-md border border-zinc-300 px-3 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="min-h-[44px] rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create booking
          </button>
        </div>
      </form>
    </div>
  );
}
