/**
 * Ride detail (FR33/FR37)
 *
 * The single place a dispatcher can see one ride in full — rider (with the
 * accessibility flag), driver, addresses, schedule, fare, and the event
 * timeline — and cancel it. Cancellation uses a no-JS confirm step (?cancel=1)
 * so a ride is never cancelled on a single stray click. Modifying a ride
 * (time/address/driver beyond assignment) is a follow-on.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime, formatMoneyCents, humanStatus } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';
import { cancelRideAction } from '@/lib/dispatch/cancelRide';
import { logPhiAccess } from '@/lib/audit/logPhiAccess';
import {
  accessibilityBadgeLabel,
  firstRelation,
  requiresAccessibleVehicle,
  type RiderAccessibility,
} from '@/lib/rider-accessibility';

export const dynamic = 'force-dynamic';

const TERMINAL_STATUSES = new Set(['completed', 'cancelled', 'no_show']);

interface RideEvent {
  id: string;
  event_type: string;
  notes: string | null;
  created_at: string | null;
}

interface RideDetail {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string | null;
  fare_cents: number | null;
  completed_at: string | null;
  created_at: string | null;
  rider: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    rider_preferences: RiderAccessibility | RiderAccessibility[] | null;
  } | null;
  driver: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  ride_events: RideEvent[] | null;
}

async function fetchRide(rideId: string): Promise<RideDetail | null> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select(
        `id, status, pickup_address, dropoff_address, scheduled_pickup_time, fare_cents,
         completed_at, created_at,
         rider:users!rider_id ( id, first_name, last_name, phone,
           rider_preferences ( mobility_aid, extra_vehicle_space ) ),
         driver:users!driver_id ( id, first_name, last_name, phone ),
         ride_events ( id, event_type, notes, created_at )`,
      )
      .eq('id', rideId)
      .maybeSingle();
    return (data as unknown as RideDetail | null) ?? null;
  } catch {
    return null;
  }
}

function statusBadgeVariant(status: string): 'default' | 'success' | 'error' | 'secondary' {
  if (status === 'completed') return 'success';
  if (status === 'no_show' || status === 'cancelled') return 'error';
  if (status === 'pending' || status === 'pending_acceptance') return 'secondary';
  return 'default';
}

export default async function RideDetailPage(props: {
  params: Promise<{ rideId: string }>;
  searchParams: Promise<{ cancel?: string }>;
}) {
  const { rideId } = await props.params;
  const { cancel } = await props.searchParams;
  const ride = await fetchRide(rideId);

  if (!ride) {
    notFound();
  }

  // FR54: record staff access to this ride's PHI (rider + destination).
  await logPhiAccess('phi_accessed', 'rides', ride.id);

  const prefs = firstRelation<RiderAccessibility>(ride.rider?.rider_preferences ?? null);
  const needsAccessible = requiresAccessibleVehicle(prefs);
  const accessLabel = accessibilityBadgeLabel(prefs);
  const isTerminal = TERMINAL_STATUSES.has(ride.status);
  const events = [...(ride.ride_events ?? [])].sort((a, b) =>
    (a.created_at ?? '').localeCompare(b.created_at ?? ''),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <Link href="/dispatch" className="text-callout font-semibold text-navy hover:underline">
            ← Dispatch
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {ride.rider?.id ? (
              <Link
                href={`/dispatch/riders/${ride.rider.id}`}
                className="text-title-2 font-semibold text-navy hover:underline"
              >
                {ride.rider.last_name}, {ride.rider.first_name}
              </Link>
            ) : (
              <span className="text-title-2 font-semibold text-ink">Unknown rider</span>
            )}
            <Badge variant={statusBadgeVariant(ride.status)}>{humanStatus(ride.status)}</Badge>
            {needsAccessible ? (
              <Badge variant="warning">
                <span aria-hidden="true">♿ </span>
                {accessLabel ?? 'Wheelchair-accessible vehicle'}
              </Badge>
            ) : null}
          </div>
          <p className="text-body text-ink-secondary">
            {ride.rider?.phone ? (
              <a
                href={`tel:${ride.rider.phone}`}
                className="font-semibold text-sage hover:text-sage-700"
              >
                {ride.rider.phone}
              </a>
            ) : (
              'No rider phone on file'
            )}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Trip</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
          <dt className="text-ink-secondary">Pickup</dt>
          <dd className="text-ink">{ride.pickup_address}</dd>
          <dt className="text-ink-secondary">Dropoff</dt>
          <dd className="text-ink">{ride.dropoff_address}</dd>
          <dt className="text-ink-secondary">Scheduled</dt>
          <dd className="text-ink">{formatDateTime(ride.scheduled_pickup_time)}</dd>
          <dt className="text-ink-secondary">Fare</dt>
          <dd className="text-ink">{formatMoneyCents(ride.fare_cents)}</dd>
          <dt className="text-ink-secondary">Driver</dt>
          <dd className="text-ink">
            {ride.driver ? (
              <>
                {ride.driver.first_name} {ride.driver.last_name}
                {ride.driver.phone ? (
                  <>
                    {' · '}
                    <a
                      href={`tel:${ride.driver.phone}`}
                      className="font-semibold text-sage hover:text-sage-700"
                    >
                      {ride.driver.phone}
                    </a>
                  </>
                ) : null}
              </>
            ) : (
              'Unassigned'
            )}
          </dd>
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Timeline</h3>
        {events.length === 0 ? (
          <p className="text-body text-ink-secondary">No events recorded yet.</p>
        ) : (
          <ul className="space-y-3 text-body">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border-hairline pb-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-ink">{humanStatus(event.event_type)}</div>
                  {event.notes ? (
                    <div className="text-caption text-ink-secondary">{event.notes}</div>
                  ) : null}
                </div>
                <div className="text-caption text-ink-secondary">
                  {formatDateTime(event.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Cancel ride</h3>
        {isTerminal ? (
          <p className="text-body text-ink-secondary">
            This ride is {humanStatus(ride.status).toLowerCase()} and can no longer be cancelled.
          </p>
        ) : cancel === '1' ? (
          <form action={cancelRideAction} className="space-y-3">
            <input type="hidden" name="rideId" value={ride.id} />
            <p className="text-body text-ink">
              Cancel this ride for {ride.rider?.first_name} {ride.rider?.last_name}? This cannot be
              undone.
            </p>
            <div>
              <label htmlFor="reason" className="mb-1 block text-caption text-ink-secondary">
                Reason (optional)
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={2}
                maxLength={500}
                className="w-full rounded-sm border border-border-strong bg-white px-3 py-2 text-body text-ink"
                placeholder="e.g. rider called to cancel"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="destructive">
                Yes, cancel this ride
              </Button>
              <Link
                href={`/dispatch/rides/${ride.id}`}
                className="text-callout font-semibold text-navy hover:underline"
              >
                Keep ride
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-body text-ink-secondary">
              Cancelling notifies no one automatically yet — contact the rider and driver as needed.
            </p>
            <Link
              href={`/dispatch/rides/${ride.id}?cancel=1`}
              className="inline-flex min-h-[44px] items-center rounded-md border border-error px-4 text-body font-semibold text-error hover:bg-error hover:text-white"
            >
              Cancel this ride
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
