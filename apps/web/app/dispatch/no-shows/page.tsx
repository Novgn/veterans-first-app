/**
 * No-Show Processing (Story 3.18)
 *
 * Lists rides that drivers marked as `no_show`. Dispatcher reviews the
 * event log (notes, photo, GPS) and either acknowledges (no action) or
 * reopens the ride back to `pending` if the no-show was in error.
 */

import { revalidatePath } from 'next/cache';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">No-Show Review</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Trips drivers flagged as no-show. Reopen if the no-show was in error.
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-hairline bg-card p-6 text-center text-body text-ink-secondary">
          No pending no-shows. Good news.
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((r) => {
            const noShowEvent = r.ride_events.find((e) => e.event_type === 'no_show');
            return (
              <Card key={r.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-title-3 font-semibold text-ink">
                        {r.rider?.first_name} {r.rider?.last_name}{' '}
                        <span className="ml-2 text-caption font-normal text-ink-secondary">
                          {r.rider?.phone ?? 'no phone'}
                        </span>
                      </div>
                      <div className="mt-1 text-caption text-ink-secondary">
                        Scheduled {formatDateTime(r.scheduled_pickup_time)} • Marked{' '}
                        {formatDateTime(r.updated_at)}
                      </div>
                      <div className="mt-3 text-body text-ink">
                        <span className="text-ink-secondary">Pickup:</span> {r.pickup_address}
                      </div>
                      <div className="text-body text-ink">
                        <span className="text-ink-secondary">Driver:</span>{' '}
                        {r.driver ? `${r.driver.first_name} ${r.driver.last_name}` : '—'}
                      </div>
                      {noShowEvent?.notes ? (
                        <div className="mt-3 rounded-md bg-stone p-3 text-body text-ink">
                          “{noShowEvent.notes}”
                        </div>
                      ) : null}
                      {noShowEvent?.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={noShowEvent.photo_url}
                          alt="Arrival evidence"
                          className="mt-3 max-w-xs rounded-md"
                        />
                      ) : null}
                    </div>

                    <form action={reopenRideAction}>
                      <input type="hidden" name="rideId" value={r.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Reopen ride
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
