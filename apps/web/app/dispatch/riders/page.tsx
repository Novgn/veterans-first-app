/**
 * Riders database (Story 3.16)
 *
 * Searchable list of riders. Dispatchers filter by name or phone using a
 * GET form (no client JS needed). Click-through opens a detail route (not
 * yet scaffolded — future story).
 */

import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RiderRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  created_at: string | null;
}

async function fetchRiders(q: string): Promise<RiderRow[]> {
  try {
    const supabase = await getServerSupabase();
    let query = supabase
      .from('users')
      .select('id, first_name, last_name, phone, email, created_at')
      .eq('role', 'rider');

    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data } = await query.order('last_name', { ascending: true }).limit(100);
    return (data as RiderRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function RidersPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await props.searchParams;
  const riders = await fetchRiders(q.trim());

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Rider Database</h2>
        <p className="text-sm text-zinc-600">
          Search by first/last name or phone. Up to 100 results shown.
        </p>
      </div>

      <form action="/dispatch/riders" method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search riders…"
          className="min-h-[40px] flex-1 rounded-md border border-zinc-300 px-3 text-sm"
          aria-label="Search riders"
        />
        <button
          type="submit"
          className="min-h-[40px] rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {riders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          {q ? `No riders match "${q}".` : 'No riders yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {r.last_name}, {r.first_name}
                  </td>
                  <td className="px-4 py-2">{r.phone}</td>
                  <td className="px-4 py-2">{r.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
