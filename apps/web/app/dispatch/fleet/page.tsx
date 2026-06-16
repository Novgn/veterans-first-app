/**
 * Fleet Map / Live Fleet (Story 3.13)
 *
 * Dispatcher view of every driver currently on an active trip, with their
 * last known GPS fix + rider destination. A map SDK is deferred to a later
 * story; this first cut is a functional, paginated table that the
 * dispatcher can actually use to coordinate.
 */

import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime, humanStatus } from '@/lib/format';

export const dynamic = 'force-dynamic';

// Status → semantic Badge variant. On an active trip the driver is "engaged"
// (navy); arrived/in_progress lean to the success cue. Color is never the sole
// signal — the Badge always carries the human-readable status text.
function statusVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'arrived':
    case 'in_progress':
      return 'success';
    case 'en_route':
      return 'default';
    case 'assigned':
      return 'secondary';
    default:
      return 'default';
  }
}

interface ActiveTripRow {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string;
  driver: { id: string; first_name: string; last_name: string; phone: string } | null;
  rider: { id: string; first_name: string; last_name: string } | null;
}

interface DriverLocationRow {
  driver_id: string;
  latitude: string;
  longitude: string;
  recorded_at: string;
}

async function fetchActiveTrips() {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from('rides')
      .select(
        `
        id, status, pickup_address, dropoff_address, scheduled_pickup_time,
        driver:users!driver_id ( id, first_name, last_name, phone ),
        rider:users!rider_id ( id, first_name, last_name )
      `,
      )
      .in('status', ['assigned', 'en_route', 'arrived', 'in_progress'])
      .order('scheduled_pickup_time', { ascending: true });

    if (error) throw error;

    const trips = (data as unknown as ActiveTripRow[] | null) ?? [];

    const driverIds = trips.map((t) => t.driver?.id).filter((id): id is string => !!id);

    let locations: DriverLocationRow[] = [];
    if (driverIds.length > 0) {
      const { data: locData } = await supabase
        .from('driver_locations')
        .select('driver_id, latitude, longitude, recorded_at')
        .in('driver_id', driverIds)
        .order('recorded_at', { ascending: false });
      locations = (locData as DriverLocationRow[] | null) ?? [];
    }

    const latestByDriver = new Map<string, DriverLocationRow>();
    for (const loc of locations) {
      if (!latestByDriver.has(loc.driver_id)) {
        latestByDriver.set(loc.driver_id, loc);
      }
    }

    return trips.map((t) => ({
      ...t,
      location: t.driver ? (latestByDriver.get(t.driver.id) ?? null) : null,
    }));
  } catch {
    return [];
  }
}

export default async function FleetPage() {
  const trips = await fetchActiveTrips();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Live Fleet</h2>
        <p className="text-body text-ink-secondary">
          {trips.length === 0
            ? 'No drivers on shift right now.'
            : `${trips.length} active ${trips.length === 1 ? 'trip' : 'trips'}.`}
        </p>
      </div>

      {trips.length === 0 ? null : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body">
              <thead>
                <tr className="border-b border-border-hairline text-left">
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Rider
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Pickup
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Dropoff
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Last location
                  </th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border-hairline align-top transition-colors last:border-b-0 hover:bg-navy-100"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink">
                        {t.driver ? `${t.driver.first_name} ${t.driver.last_name}` : '—'}
                      </div>
                      {t.driver?.phone ? (
                        <a
                          href={`tel:${t.driver.phone}`}
                          className="text-caption font-semibold text-sage hover:text-sage-700"
                        >
                          Call {t.driver.phone}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-ink">
                      {t.rider ? `${t.rider.first_name} ${t.rider.last_name}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(t.status)}>{humanStatus(t.status)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-ink">{t.pickup_address}</td>
                    <td className="px-6 py-4 text-ink">{t.dropoff_address}</td>
                    <td className="px-6 py-4 text-caption">
                      {t.location ? (
                        <>
                          <div className="text-ink">
                            {Number(t.location.latitude).toFixed(4)},{' '}
                            {Number(t.location.longitude).toFixed(4)}
                          </div>
                          <div className="text-ink-secondary">
                            {formatDateTime(t.location.recorded_at)}
                          </div>
                        </>
                      ) : (
                        <span className="text-ink-secondary">no fix yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
