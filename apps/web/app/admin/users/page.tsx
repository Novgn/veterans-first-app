/**
 * Staff users list (Story 5.16).
 */

import Link from 'next/link';

import { changeUserRole, resetUserPassword } from '@/lib/admin/userActions';
import { getServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface StaffRow {
  id: string;
  clerk_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string;
  created_at: string | null;
}

async function fetchStaff(): Promise<StaffRow[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('users')
      .select('id, clerk_id, first_name, last_name, email, role, created_at')
      .in('role', ['admin', 'dispatcher'])
      .order('last_name');
    return (data as StaffRow[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await props.searchParams;
  const staff = await fetchStaff();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Staff accounts</h2>
          <p className="text-sm text-zinc-600">Admins and dispatchers only.</p>
        </div>
        <Link
          href="/admin/users/invite"
          className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Invite user
        </Link>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800" role="status">
          {ok}
        </div>
      ) : null}

      {staff.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          No staff accounts yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {u.last_name}, {u.first_name}
                  </td>
                  <td className="px-4 py-2">{u.email ?? '—'}</td>
                  <td className="px-4 py-2">
                    <form action={changeUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="clerkUserId" value={u.clerk_id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="h-9 rounded-md border border-zinc-300 px-2 text-xs"
                      >
                        <option value="admin">Admin</option>
                        <option value="dispatcher">Dispatcher</option>
                      </select>
                      <button
                        type="submit"
                        className="h-9 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white"
                      >
                        Save role
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    <form action={resetUserPassword}>
                      <input type="hidden" name="clerkUserId" value={u.clerk_id} />
                      <button
                        type="submit"
                        className="h-9 rounded-md border border-zinc-300 px-3 text-xs font-medium"
                      >
                        Reset password
                      </button>
                    </form>
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
