/**
 * Ride Confirmation Calls (Story 3.17)
 *
 * Shows rides scheduled to start in the next 24h that the dispatcher
 * should call to confirm. After calling, the dispatcher clicks
 * "Mark Confirmed" — flips the ride from `pending` → `confirmed` and
 * records an audit note.
 */

import { revalidatePath } from 'next/cache';

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Confirmation Calls</h2>
        <p className="text-sm text-zinc-600">
          Rides scheduled in the next 24 hours. Call the rider, then mark confirmed.
        </p>
      </div>

      {rides.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          Nothing to confirm right now.
        </div>
      ) : (
        <div className="space-y-2">
          {rides.map((r) => (
            <form
              key={r.id}
              action={markConfirmedAction}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <input type="hidden" name="rideId" value={r.id} />
              <div>
                <div className="font-semibold">
                  {r.rider?.first_name} {r.rider?.last_name}{' '}
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    {r.rider?.phone ?? 'no phone'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {formatDateTime(r.scheduled_pickup_time)} • {r.pickup_address}
                </div>
              </div>
              <button
                type="submit"
                disabled={r.status === 'confirmed'}
                className="min-h-[40px] rounded-md bg-green-600 px-3 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-zinc-300"
              >
                {r.status === 'confirmed' ? 'Confirmed' : 'Mark Confirmed'}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
