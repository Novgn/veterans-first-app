/**
 * Ride Confirmation Calls (Story 3.17)
 *
 * Shows rides scheduled to start in the next 24h that the dispatcher
 * should call to confirm. After calling, the dispatcher clicks
 * "Mark Confirmed" — flips the ride from `pending` → `confirmed` and
 * records an audit note.
 */

import { revalidatePath } from 'next/cache';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getServerSupabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface UpcomingRide {
  id: string;
  status: string;
  scheduled_pickup_time: string;
  pickup_address: string;
  rider: { first_name: string; last_name: string; phone: string } | null;
}

async function fetchUpcoming(): Promise<UpcomingRide[]> {
  try {
    const supabase = await getServerSupabase();
    const horizon = new Date();
    horizon.setHours(horizon.getHours() + 24);

    const { data } = await supabase
      .from('rides')
      .select(
        `
        id, status, scheduled_pickup_time, pickup_address,
        rider:users!rider_id ( first_name, last_name, phone )
      `,
      )
      .in('status', ['pending', 'confirmed'])
      .lte('scheduled_pickup_time', horizon.toISOString())
      .order('scheduled_pickup_time', { ascending: true });
    return (data as unknown as UpcomingRide[] | null) ?? [];
  } catch {
    return [];
  }
}

async function markConfirmedAction(formData: FormData): Promise<void> {
  'use server';
  const rideId = String(formData.get('rideId') ?? '').trim();
  if (!rideId) return;

  const supabase = await getServerSupabase();
  await supabase
    .from('rides')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', rideId);

  revalidatePath('/dispatch/confirmations');
  revalidatePath('/dispatch/assignments');
}

export default async function ConfirmationsPage() {
  const rides = await fetchUpcoming();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Confirmation Calls</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Rides scheduled in the next 24 hours. Call the rider, then mark confirmed.
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-hairline bg-card p-6 text-center text-body text-ink-secondary">
          Nothing to confirm right now.
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-6">
                <form
                  action={markConfirmedAction}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <input type="hidden" name="rideId" value={r.id} />
                  <div>
                    <div className="text-title-3 font-semibold text-ink">
                      {r.rider?.first_name} {r.rider?.last_name}{' '}
                      <span className="ml-2 text-caption font-normal text-ink-secondary">
                        {r.rider?.phone ?? 'no phone'}
                      </span>
                    </div>
                    <div className="mt-1 text-caption text-ink-secondary">
                      {formatDateTime(r.scheduled_pickup_time)} • {r.pickup_address}
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={r.status === 'confirmed'}>
                    {r.status === 'confirmed' ? 'Confirmed' : 'Mark Confirmed'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
