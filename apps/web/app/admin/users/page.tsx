/**
 * Staff users list (Story 5.16).
 */

import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-title-2 font-semibold text-ink">Staff accounts</h2>
          <p className="mt-1 text-body text-ink-secondary">Admins and dispatchers only.</p>
        </div>
        <Link href="/admin/users/invite">
          <Button size="lg">Add staff member</Button>
        </Link>
      </div>

      {error ? (
        <div
          className="rounded-md border border-error bg-error-100 p-4 text-body text-ink"
          role="alert"
        >
          {error}
        </div>
      ) : null}
      {ok ? (
        <div
          className="rounded-md border border-success bg-success-100 p-4 text-body text-ink"
          role="status"
          aria-live="polite"
        >
          {ok}
        </div>
      ) : null}

      {staff.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-body text-ink-secondary">
            No staff members yet. Add your first.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-border-hairline text-left text-caption font-semibold text-ink-secondary">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id} className="border-b border-border-hairline last:border-0">
                    <td className="px-4 py-3 font-semibold text-ink">
                      {u.last_name}, {u.first_name}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{u.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                          {u.role === 'admin' ? 'Admin' : 'Dispatcher'}
                        </Badge>
                        <form action={changeUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="clerkUserId" value={u.clerk_id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            aria-label="Change role"
                            className="h-10 rounded-sm border border-border-strong bg-card px-3 text-callout text-ink"
                          >
                            <option value="admin">Admin</option>
                            <option value="dispatcher">Dispatcher</option>
                          </select>
                          <Button type="submit" size="sm">
                            Save role
                          </Button>
                        </form>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <form action={resetUserPassword}>
                        <input type="hidden" name="clerkUserId" value={u.clerk_id} />
                        <Button type="submit" variant="outline" size="sm">
                          Reset password
                        </Button>
                      </form>
                    </td>
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
