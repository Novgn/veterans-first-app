/**
 * Riders database (Story 3.16)
 *
 * Searchable list of riders. Dispatchers filter by name or phone using a
 * GET form (no client JS needed). Each row links to the rider detail page.
 */

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getServerSupabase } from '@/lib/supabase';
import { logPhiAccess } from '@/lib/audit/logPhiAccess';

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
  const query = q.trim();
  const riders = await fetchRiders(query);

  // FR54: a rider search exposes PHI (names/phones) — record the access.
  if (query) {
    await logPhiAccess('rider_search_performed', 'rider_search', null, {
      query,
      result_count: riders.length,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Rider Database</h2>
        <p className="text-body text-ink-secondary">
          Search by first/last name or phone. Up to 100 results shown.
        </p>
      </div>

      <form
        action="/dispatch/riders"
        method="get"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            name="q"
            defaultValue={q}
            label="Search riders by name or phone"
            placeholder="Search riders…"
            aria-label="Search riders"
          />
        </div>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      {riders.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-body text-ink-secondary">
          {q ? `No riders match "${q}".` : 'No riders yet.'}
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
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {riders.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border-hairline transition-colors last:border-b-0 hover:bg-navy-100"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dispatch/riders/${r.id}`}
                        className="font-semibold text-navy hover:underline"
                      >
                        {r.last_name}, {r.first_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {r.phone ? (
                        <a
                          href={`tel:${r.phone}`}
                          className="font-semibold text-sage hover:text-sage-700"
                        >
                          Call {r.phone}
                        </a>
                      ) : (
                        <span className="text-ink-secondary">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink">{r.email ?? '—'}</td>
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
