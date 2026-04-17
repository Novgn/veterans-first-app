/**
 * Driver detail (Story 5.2)
 *
 * Contact, vehicle, status + deactivate action. Status toggle is a server
 * action that reassigns safe rides and blocks when in-progress rides are
 * active (see REASSIGNABLE_RIDE_STATUSES / BLOCKING_RIDE_STATUSES).
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import { classifyDriverRides, type DriverRideSummary } from '@veterans-first/shared/utils';

import { formatDateTime } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';
import { setDriverActiveStatus } from '@/lib/admin/deactivateDriver';

export const dynamic = 'force-dynamic';

interface DriverDetail {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  created_at: string | null;
  driver_profiles: {
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: string | null;
    vehicle_color: string | null;
    vehicle_plate: string | null;
    bio: string | null;
    years_experience: string | null;
    is_active: boolean | null;
  } | null;
}

async function fetchDriver(driverId: string): Promise<DriverDetail | null> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, phone, email, created_at, driver_profiles(vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, bio, years_experience, is_active)',
      )
      .eq('id', driverId)
      .eq('role', 'driver')
      .maybeSingle();
    const row = data as unknown as DriverDetail | null;
    if (!row) return null;
    return {
      ...row,
      driver_profiles: Array.isArray(row.driver_profiles)
        ? (row.driver_profiles[0] ?? null)
        : row.driver_profiles,
    };
  } catch {
    return null;
  }
}

async function fetchAssignedRides(driverId: string): Promise<DriverRideSummary[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select('id, status')
      .eq('driver_id', driverId)
      .in('status', [
        'pending',
        'confirmed',
        'assigned',
        'pending_acceptance',
        'en_route',
        'in_progress',
        'arrived',
      ]);
    return (data as DriverRideSummary[]) ?? [];
  } catch {
    return [];
  }
}

async function fetchRideHistory(driverId: string) {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select('id, status, pickup_address, dropoff_address, scheduled_pickup_time, completed_at')
      .eq('driver_id', driverId)
      .order('scheduled_pickup_time', { ascending: false })
      .limit(25);
    return (
      (data as Array<{
        id: string;
        status: string;
        pickup_address: string;
        dropoff_address: string;
        scheduled_pickup_time: string | null;
        completed_at: string | null;
      }>) ?? []
    );
  } catch {
    return [];
  }
}

export default async function DriverDetailPage(props: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await props.params;
  const [driver, assigned, history] = await Promise.all([
    fetchDriver(driverId),
    fetchAssignedRides(driverId),
    fetchRideHistory(driverId),
  ]);

  if (!driver) {
    notFound();
  }

  const classification = classifyDriverRides(assigned);
  const isActive = driver.driver_profiles?.is_active ?? true;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/drivers" className="text-sm text-blue-600 hover:underline">
            ← All drivers
          </Link>
          <h2 className="mt-1 text-lg font-semibold">
            {driver.last_name}, {driver.first_name}
          </h2>
          <p className="text-sm text-zinc-600">{driver.phone}</p>
        </div>
        <span
          className={
            isActive
              ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'
              : 'rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700'
          }
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Vehicle</h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-zinc-500">Make / Model</dt>
          <dd>
            {driver.driver_profiles?.vehicle_year ?? ''}{' '}
            {driver.driver_profiles?.vehicle_make ?? '—'}{' '}
            {driver.driver_profiles?.vehicle_model ?? ''}
          </dd>
          <dt className="text-zinc-500">Color</dt>
          <dd>{driver.driver_profiles?.vehicle_color ?? '—'}</dd>
          <dt className="text-zinc-500">Plate</dt>
          <dd>{driver.driver_profiles?.vehicle_plate ?? '—'}</dd>
          <dt className="text-zinc-500">Years of experience</dt>
          <dd>{driver.driver_profiles?.years_experience ?? '—'}</dd>
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Status</h3>
        <form action={setDriverActiveStatus}>
          <input type="hidden" name="driverId" value={driver.id} />
          <input type="hidden" name="active" value={isActive ? 'false' : 'true'} />
          {isActive ? (
            <>
              <p className="mb-2 text-sm text-zinc-600">
                Deactivating removes this driver from future assignments. Safe scheduled rides will
                be unassigned for reassignment.
              </p>
              {classification.blocking.length > 0 ? (
                <p className="mb-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">
                  Cannot deactivate: {classification.blocking.length} ride(s) still in progress.
                  Complete them first.
                </p>
              ) : null}
              {classification.reassignable.length > 0 ? (
                <p className="mb-2 text-xs text-zinc-500">
                  {classification.reassignable.length} upcoming ride(s) will be unassigned.
                </p>
              ) : null}
              <button
                type="submit"
                disabled={!classification.canDeactivate}
                className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Deactivate driver
              </button>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm text-zinc-600">
                Reactivating lets this driver receive new ride offers again.
              </p>
              <button
                type="submit"
                className="h-10 rounded-md bg-green-600 px-4 text-sm font-semibold text-white"
              >
                Reactivate driver
              </button>
            </>
          )}
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Recent rides</h3>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">No rides yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((ride) => (
              <li key={ride.id} className="flex justify-between border-b border-zinc-100 pb-2">
                <div>
                  <div className="font-medium">
                    {ride.pickup_address} → {ride.dropoff_address}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatDateTime(ride.scheduled_pickup_time)} · {ride.status}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  {ride.completed_at ? formatDateTime(ride.completed_at) : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
