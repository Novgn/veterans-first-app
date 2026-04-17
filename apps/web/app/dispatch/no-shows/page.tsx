/**
 * No-Show Processing (Story 3.18)
 *
 * Lists rides that drivers marked as `no_show`. Dispatcher reviews the
 * event log (notes, photo, GPS) and either acknowledges (no action) or
 * reopens the ride back to `pending` if the no-show was in error.
 */

import { revalidatePath } from 'next/cache';

import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface NoShowRow {
  id: string;
  scheduled_pickup_time: string;
  pickup_address: string;
  dropoff_address: string;
  updated_at: string | null;
  rider: { first_name: string; last_name: string; phone: string } | null;
  driver: { first_name: string; last_name: string } | null;
  ride_events: Array<{
    id: string;
    event_type: string;
    notes: string | null;
    photo_url: string | null;
    lat: string | null;
    lng: string | null;
    created_at: string | null;
  }>;
}

async function fetchNoShows(): Promise<NoShowRow[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select(
        `
        id, scheduled_pickup_time, pickup_address, dropoff_address, updated_at,
        rider:users!rider_id ( first_name, last_name, phone ),
        driver:users!driver_id ( first_name, last_name ),
        ride_events ( id, event_type, notes, photo_url, lat, lng, created_at )
      `,
      )
      .eq('status', 'no_show')
      .order('updated_at', { ascending: false });
    return (data as unknown as NoShowRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function reopenRideAction(formData: FormData): Promise<void> {
  'use server';
  const rideId = String(formData.get('rideId') ?? '').trim();
  if (!rideId) return;

  const supabase = await getServerSupabase();
  await supabase
    .from('rides')
    .update({
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId);

  revalidatePath('/dispatch/no-shows');
  revalidatePath('/dispatch/assignments');
}

export default async function NoShowsPage() {
  const rides = await fetchNoShows();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">No-Show Review</h2>
        <p className="text-sm text-zinc-600">
          Trips drivers flagged as no-show. Reopen if the no-show was in error.
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No pending no-shows. Good news.
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((r) => {
            const noShowEvent = r.ride_events.find((e) => e.event_type === 'no_show');
            return (
              <div key={r.id} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold">
                      {r.rider?.first_name} {r.rider?.last_name}{' '}
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        {r.rider?.phone ?? 'no phone'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Scheduled {formatDateTime(r.scheduled_pickup_time)} • Marked{' '}
                      {formatDateTime(r.updated_at)}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-zinc-500">Pickup:</span> {r.pickup_address}
                    </div>
                    <div className="text-sm">
                      <span className="text-zinc-500">Driver:</span>{' '}
                      {r.driver ? `${r.driver.first_name} ${r.driver.last_name}` : '—'}
                    </div>
                    {noShowEvent?.notes ? (
                      <div className="mt-2 rounded-md bg-zinc-50 p-2 text-sm">
                        “{noShowEvent.notes}”
                      </div>
                    ) : null}
                    {noShowEvent?.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={noShowEvent.photo_url}
                        alt="Arrival evidence"
                        className="mt-2 max-w-xs rounded-md"
                      />
                    ) : null}
                  </div>

                  <form action={reopenRideAction}>
                    <input type="hidden" name="rideId" value={r.id} />
                    <button
                      type="submit"
                      className="min-h-[40px] rounded-md bg-amber-600 px-3 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      Reopen ride
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
