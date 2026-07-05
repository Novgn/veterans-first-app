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

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <Link
            href="/admin/drivers"
            className="text-callout font-semibold text-navy hover:underline"
          >
            ← All drivers
          </Link>
          <h2 className="mt-1 text-title-2 font-semibold text-ink">
            {driver.last_name}, {driver.first_name}
          </h2>
          <p className="text-body text-ink-secondary">{driver.phone}</p>
        </div>
        <Badge variant={isActive ? 'success' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Vehicle</h3>
        <dl className="grid grid-cols-2 gap-3 text-body">
          <dt className="text-ink-secondary">Make / Model</dt>
          <dd className="text-ink">
            {driver.driver_profiles?.vehicle_year ?? ''}{' '}
            {driver.driver_profiles?.vehicle_make ?? '—'}{' '}
            {driver.driver_profiles?.vehicle_model ?? ''}
          </dd>
          <dt className="text-ink-secondary">Color</dt>
          <dd className="text-ink">{driver.driver_profiles?.vehicle_color ?? '—'}</dd>
          <dt className="text-ink-secondary">Plate</dt>
          <dd className="text-ink">{driver.driver_profiles?.vehicle_plate ?? '—'}</dd>
          <dt className="text-ink-secondary">Years of experience</dt>
          <dd className="text-ink">{driver.driver_profiles?.years_experience ?? '—'}</dd>
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Status</h3>
        <form action={setDriverActiveStatus}>
          <input type="hidden" name="driverId" value={driver.id} />
          <input type="hidden" name="active" value={isActive ? 'false' : 'true'} />
          {isActive ? (
            <>
              <p className="mb-3 text-body text-ink-secondary">
                Deactivating removes this driver from future assignments. Safe scheduled rides will
                be unassigned for reassignment.
              </p>
              {classification.blocking.length > 0 ? (
                <p className="mb-3 flex items-start gap-2 rounded-md border border-warning bg-warning-100 p-3 text-body text-ink">
                  <span aria-hidden="true">⚠</span>
                  <span>
                    Cannot deactivate: {classification.blocking.length} ride(s) still in progress.
                    Complete them first.
                  </span>
                </p>
              ) : null}
              {classification.reassignable.length > 0 ? (
                <p className="mb-3 text-caption text-ink-secondary">
                  {classification.reassignable.length} upcoming ride(s) will be unassigned.
                </p>
              ) : null}
              <Button type="submit" variant="destructive" disabled={!classification.canDeactivate}>
                Deactivate driver
              </Button>
            </>
          ) : (
            <>
              <p className="mb-3 text-body text-ink-secondary">
                Reactivating lets this driver receive new ride offers again.
              </p>
              <Button type="submit">Reactivate driver</Button>
            </>
          )}
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Recent rides</h3>
        {history.length === 0 ? (
          <p className="text-body text-ink-secondary">No rides yet.</p>
        ) : (
          <ul className="space-y-3 text-body">
            {history.map((ride) => (
              <li
                key={ride.id}
                className="flex justify-between gap-4 border-b border-border-hairline pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <div className="font-semibold text-ink">
                    {ride.pickup_address} → {ride.dropoff_address}
                  </div>
                  <div className="text-caption text-ink-secondary">
                    {formatDateTime(ride.scheduled_pickup_time)} · {ride.status}
                  </div>
                </div>
                <div className="text-caption text-ink-secondary">
                  {ride.completed_at ? formatDateTime(ride.completed_at) : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
