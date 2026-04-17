/**
 * Assignments (Story 3.14)
 *
 * Two columns: pending bookings and available drivers. Dispatcher chooses
 * a driver for each ride via a server action that writes to
 * `rides.driver_id` + `rides.status = 'assigned'`.
 *
 * Reassignment: the same form can target already-assigned rides by passing
 * a different driver — the server action overwrites without a separate
 * endpoint.
 */

import { revalidatePath } from 'next/cache';

import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime, humanStatus } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface PendingRide {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string;
  driver_id: string | null;
  rider: { first_name: string; last_name: string; phone: string } | null;
}

interface DriverOption {
  id: string;
  first_name: string;
  last_name: string;
}

async function fetchData(): Promise<{ rides: PendingRide[]; drivers: DriverOption[] }> {
  try {
    const supabase = await getServerSupabase();
    const [ridesRes, driversRes] = await Promise.all([
      supabase
        .from('rides')
        .select(
          `
          id, status, pickup_address, dropoff_address, scheduled_pickup_time, driver_id,
          rider:users!rider_id ( first_name, last_name, phone )
        `,
        )
        .in('status', ['pending', 'confirmed', 'pending_acceptance', 'assigned'])
        .order('scheduled_pickup_time', { ascending: true }),
      supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('role', 'driver')
        .order('first_name', { ascending: true }),
    ]);

    return {
      rides: (ridesRes.data as unknown as PendingRide[] | null) ?? [],
      drivers: (driversRes.data as DriverOption[] | null) ?? [],
    };
  } catch {
    return { rides: [], drivers: [] };
  }
}

async function assignRideAction(formData: FormData): Promise<void> {
  'use server';
  const rideId = String(formData.get('rideId') ?? '');
  const driverId = String(formData.get('driverId') ?? '');
  if (!rideId || !driverId) return;

  const supabase = await getServerSupabase();
  await supabase
    .from('rides')
    .update({
      driver_id: driverId,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId);

  revalidatePath('/dispatch/assignments');
}

export default async function AssignmentsPage() {
  const { rides, drivers } = await fetchData();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ride Assignments</h2>
        <p className="text-sm text-zinc-600">
          Assign or reassign drivers to pending and confirmed rides.
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No rides awaiting assignment.
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <form
              key={ride.id}
              action={assignRideAction}
              className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200 p-4 sm:grid-cols-[1fr_auto]"
            >
              <input type="hidden" name="rideId" value={ride.id} />
              <div className="text-sm">
                <div className="font-semibold">
                  {ride.rider?.first_name} {ride.rider?.last_name}{' '}
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    {ride.rider?.phone ?? 'no phone'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {humanStatus(ride.status)} • {formatDateTime(ride.scheduled_pickup_time)}
                </div>
                <div className="mt-2">
                  <span className="text-zinc-500">Pickup:</span> {ride.pickup_address}
                </div>
                <div>
                  <span className="text-zinc-500">Dropoff:</span> {ride.dropoff_address}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`driver-${ride.id}`}>
                  Driver
                </label>
                <select
                  id={`driver-${ride.id}`}
                  name="driverId"
                  defaultValue={ride.driver_id ?? ''}
                  className="min-h-[40px] rounded-md border border-zinc-300 px-3 text-sm"
                >
                  <option value="">Select driver…</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.first_name} {d.last_name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="min-h-[40px] rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {ride.driver_id ? 'Reassign' : 'Assign'}
                </button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
