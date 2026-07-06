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
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime, humanStatus } from '@/lib/format';
import {
  accessibilityBadgeLabel,
  firstRelation,
  requiresAccessibleVehicle,
  type RiderAccessibility,
} from '@/lib/rider-accessibility';

export const dynamic = 'force-dynamic';

interface PendingRide {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string;
  driver_id: string | null;
  rider: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    rider_preferences: RiderAccessibility | RiderAccessibility[] | null;
  } | null;
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
          rider:users!rider_id ( id, first_name, last_name, phone,
            rider_preferences ( mobility_aid, extra_vehicle_space ) )
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
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Ride Assignments</h2>
        <p className="text-body text-ink-secondary">
          Assign or reassign drivers to pending and confirmed rides.
        </p>
      </div>

      {rides.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          No rides awaiting assignment.
        </Card>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const prefs = firstRelation<RiderAccessibility>(ride.rider?.rider_preferences ?? null);
            const needsAccessible = requiresAccessibleVehicle(prefs);
            const accessLabel = accessibilityBadgeLabel(prefs);
            return (
              <Card key={ride.id} className="p-6">
                <form
                  action={assignRideAction}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-start"
                >
                  <input type="hidden" name="rideId" value={ride.id} />
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      {ride.rider?.id ? (
                        <Link
                          href={`/dispatch/riders/${ride.rider.id}`}
                          className="text-title-3 font-semibold text-navy hover:underline"
                        >
                          {ride.rider.first_name} {ride.rider.last_name}
                        </Link>
                      ) : (
                        <span className="text-title-3 font-semibold text-ink">Unknown rider</span>
                      )}
                      {needsAccessible ? (
                        <Badge variant="warning">
                          <span aria-hidden="true">♿ </span>
                          {accessLabel ?? 'Wheelchair-accessible vehicle'}
                        </Badge>
                      ) : null}
                      {ride.rider?.phone ? (
                        <a
                          href={`tel:${ride.rider.phone}`}
                          className="text-callout font-semibold text-sage hover:text-sage-700"
                        >
                          Call {ride.rider.phone}
                        </a>
                      ) : (
                        <span className="text-callout text-ink-secondary">no phone</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Badge variant="default">{humanStatus(ride.status)}</Badge>
                      <span className="text-callout text-ink-secondary">
                        {formatDateTime(ride.scheduled_pickup_time)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1 text-body text-ink">
                      <div>
                        <span className="text-ink-secondary">Pickup:</span> {ride.pickup_address}
                      </div>
                      <div>
                        <span className="text-ink-secondary">Dropoff:</span> {ride.dropoff_address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`driver-${ride.id}`}>
                      Driver
                    </label>
                    <select
                      id={`driver-${ride.id}`}
                      name="driverId"
                      defaultValue={ride.driver_id ?? ''}
                      className="h-12 rounded-sm border border-border-strong bg-white px-3 text-body text-ink"
                    >
                      <option value="">Select driver…</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.first_name} {d.last_name}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="md">
                      {ride.driver_id ? 'Reassign' : 'Assign'}
                    </Button>
                  </div>
                </form>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
