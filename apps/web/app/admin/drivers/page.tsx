/**
 * Driver Roster (Story 5.2)
 *
 * Lists every driver in the users + driver_profiles join. Admin-only —
 * layout already enforces role. Search by name or phone via a GET form
 * (no client JS required). Click-through opens a detail page.
 */

import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <h2 className="text-title-2 font-semibold text-ink">Driver Roster</h2>
          <p className="text-body text-ink-secondary">
            All drivers, active and inactive. Up to 100 results shown.
          </p>
        </div>
        <Link href="/admin/drivers/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Add Driver</Button>
        </Link>
      </div>

      <form
        action="/admin/drivers"
        method="get"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            name="q"
            defaultValue={q}
            label="Search drivers by name or phone"
            placeholder="Search drivers…"
            aria-label="Search drivers"
          />
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      {drivers.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          {q ? `No drivers match "${q}".` : 'No drivers yet. Add your first driver.'}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-body">
              <thead>
                <tr className="border-b border-border-hairline text-left">
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Name
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                    Status
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => {
                  const isActive = d.driver_profiles?.is_active ?? true;
                  const vehicle = d.driver_profiles
                    ? `${d.driver_profiles.vehicle_make ?? ''} ${d.driver_profiles.vehicle_model ?? ''} · ${d.driver_profiles.vehicle_plate ?? ''}`.trim()
                    : '—';
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-border-hairline transition-colors last:border-b-0 hover:bg-navy-100"
                    >
                      <td className="px-6 py-4 font-semibold text-ink">
                        {d.last_name}, {d.first_name}
                      </td>
                      <td className="px-6 py-4 text-ink">{d.phone}</td>
                      <td className="px-6 py-4 text-ink">{vehicle}</td>
                      <td className="px-6 py-4">
                        <Badge variant={isActive ? 'success' : 'secondary'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/drivers/${d.id}`}
                          className="font-semibold text-navy hover:text-navy-700"
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
        </Card>
      )}
    </div>
  );
}
