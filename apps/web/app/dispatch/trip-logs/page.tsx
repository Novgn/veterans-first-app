/**
 * Trip Logs (Story 3.19)
 *
 * End-of-day documentation view. Completed trips with their full event
 * timeline, fare, and mileage. Mileage is derived client-side from GPS
 * events via haversine — not authoritative, but good enough for payroll
 * review. Replace with an official odometer entry in a future iteration.
 */

import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime, formatMoneyCents } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface TripLogRow {
  id: string;
  status: string;
  fare_cents: number | null;
  completed_at: string | null;
  pickup_address: string;
  dropoff_address: string;
  rider: { first_name: string; last_name: string } | null;
  driver: { first_name: string; last_name: string } | null;
  ride_events: Array<{
    id: string;
    event_type: string;
    lat: string | null;
    lng: string | null;
    created_at: string | null;
  }>;
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa = Math.sin(dLat / 2);
  const sb = Math.sin(dLng / 2);
  const cosA = Math.cos(toRad(a.lat));
  const cosB = Math.cos(toRad(b.lat));
  const h = sa * sa + cosA * cosB * sb * sb;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateMilesFromEvents(
  events: Array<{ lat: string | null; lng: string | null }>,
): number {
  const pts = events
    .map((e) => (e.lat && e.lng ? { lat: Number(e.lat), lng: Number(e.lng) } : null))
    .filter((p): p is { lat: number; lng: number } => p !== null);
  let meters = 0;
  for (let i = 1; i < pts.length; i++) {
    meters += haversineMeters(pts[i - 1]!, pts[i]!);
  }
  return meters / 1609.34;
}

async function fetchCompleted(): Promise<TripLogRow[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select(
        `
        id, status, fare_cents, completed_at, pickup_address, dropoff_address,
        rider:users!rider_id ( first_name, last_name ),
        driver:users!driver_id ( first_name, last_name ),
        ride_events ( id, event_type, lat, lng, created_at )
      `,
      )
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(100);
    return (data as unknown as TripLogRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function TripLogsPage() {
  const trips = await fetchCompleted();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Trip Logs</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Most recent 100 completed trips. Mileage is estimated from GPS events.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-hairline bg-card p-6 text-center text-body text-ink-secondary">
          No completed trips yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-hairline bg-card shadow-card">
          <table className="w-full text-body">
            <thead className="border-b border-border-hairline bg-stone text-left">
              <tr>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">
                  Completed
                </th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Driver</th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Rider</th>
                <th className="px-4 py-3 text-caption font-semibold text-ink-secondary">Route</th>
                <th className="px-4 py-3 text-right text-caption font-semibold text-ink-secondary">
                  Miles (est.)
                </th>
                <th className="px-4 py-3 text-right text-caption font-semibold text-ink-secondary">
                  Fare
                </th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => {
                const miles = estimateMilesFromEvents(t.ride_events);
                return (
                  <tr key={t.id} className="border-t border-border-hairline align-top text-ink">
                    <td className="px-4 py-3">{formatDateTime(t.completed_at)}</td>
                    <td className="px-4 py-3">
                      {t.driver ? `${t.driver.first_name} ${t.driver.last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {t.rider ? `${t.rider.first_name} ${t.rider.last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div>{t.pickup_address}</div>
                      <div className="text-caption text-ink-secondary">→ {t.dropoff_address}</div>
                    </td>
                    <td className="px-4 py-3 text-right">{miles.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">{formatMoneyCents(t.fare_cents)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
