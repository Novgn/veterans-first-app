/**
 * Driver Roster (Story 5.2)
 *
 * Lists every driver in the users + driver_profiles join. Admin-only —
 * layout already enforces role. Search by name or phone via a GET form
 * (no client JS required). Click-through opens a detail page.
 */

import Link from 'next/link';

import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface DriverRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  driver_profiles: {
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_plate: string | null;
    is_active: boolean | null;
  } | null;
}

async function fetchDrivers(q: string): Promise<DriverRow[]> {
  try {
    const supabase = await getServerSupabase();
    let query = supabase
      .from('users')
      .select(
        'id, first_name, last_name, phone, email, driver_profiles(vehicle_make, vehicle_model, vehicle_plate, is_active)',
      )
      .eq('role', 'driver');

    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data } = await query.order('last_name', { ascending: true }).limit(100);
    return ((data as unknown as DriverRow[]) ?? []).map((row) => ({
      ...row,
      driver_profiles: Array.isArray(row.driver_profiles)
        ? (row.driver_profiles[0] ?? null)
        : row.driver_profiles,
    }));
  } catch {
    return [];
  }
}

export default async function AdminDriversPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await props.searchParams;
  const drivers = await fetchDrivers(q.trim());

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Driver Roster</h2>
          <p className="text-sm text-zinc-600">
            All drivers, active and inactive. Up to 100 results shown.
          </p>
        </div>
        <Link
          href="/admin/drivers/new"
          className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Add Driver
        </Link>
      </div>

      <form action="/admin/drivers" method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search drivers…"
          className="min-h-[40px] flex-1 rounded-md border border-zinc-300 px-3 text-sm"
          aria-label="Search drivers"
        />
        <button
          type="submit"
          className="min-h-[40px] rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {drivers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          {q ? `No drivers match "${q}".` : 'No drivers yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Vehicle</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const isActive = d.driver_profiles?.is_active ?? true;
                const vehicle = d.driver_profiles
                  ? `${d.driver_profiles.vehicle_make ?? ''} ${d.driver_profiles.vehicle_model ?? ''} · ${d.driver_profiles.vehicle_plate ?? ''}`.trim()
                  : '—';
                return (
                  <tr key={d.id} className="border-t border-zinc-100">
                    <td className="px-4 py-2">
                      {d.last_name}, {d.first_name}
                    </td>
                    <td className="px-4 py-2">{d.phone}</td>
                    <td className="px-4 py-2">{vehicle}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          isActive
                            ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
                            : 'rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700'
                        }
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/admin/drivers/${d.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
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
