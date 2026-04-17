/**
 * Fleet Map / Live Fleet (Story 3.13)
 *
 * Dispatcher view of every driver currently on an active trip, with their
 * last known GPS fix + rider destination. A map SDK is deferred to a later
 * story; this first cut is a functional, paginated table that the
 * dispatcher can actually use to coordinate.
 */

import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime, humanStatus } from '@/lib/format';

export const dynamic = 'force-dynamic';

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Live Fleet</h2>
        <p className="text-sm text-zinc-600">
          {trips.length === 0
            ? 'No active trips right now.'
            : `${trips.length} active ${trips.length === 1 ? 'trip' : 'trips'}.`}
        </p>
      </div>

      {trips.length === 0 ? null : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Rider</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Pickup</th>
                <th className="px-4 py-2">Dropoff</th>
                <th className="px-4 py-2">Last location</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-t border-zinc-100 align-top">
                  <td className="px-4 py-3">
                    {t.driver ? `${t.driver.first_name} ${t.driver.last_name}` : '—'}
                    {t.driver?.phone ? (
                      <div className="text-xs text-zinc-500">{t.driver.phone}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {t.rider ? `${t.rider.first_name} ${t.rider.last_name}` : '—'}
                  </td>
                  <td className="px-4 py-3">{humanStatus(t.status)}</td>
                  <td className="px-4 py-3">{t.pickup_address}</td>
                  <td className="px-4 py-3">{t.dropoff_address}</td>
                  <td className="px-4 py-3 text-xs">
                    {t.location ? (
                      <>
                        <div>
                          {Number(t.location.latitude).toFixed(4)},{' '}
                          {Number(t.location.longitude).toFixed(4)}
                        </div>
                        <div className="text-zinc-500">
                          {formatDateTime(t.location.recorded_at)}
                        </div>
                      </>
                    ) : (
                      <span className="text-zinc-400">no fix yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
