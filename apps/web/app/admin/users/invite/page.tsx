/**
 * Invite staff user (Story 5.16).
 */

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { inviteStaffUser } from '@/lib/admin/userActions';

export default async function InviteUserPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/admin/users" className="text-callout font-semibold text-navy hover:underline">
          ← Staff accounts
        </Link>
        <h2 className="mt-2 text-title-2 font-semibold text-ink">Add staff member</h2>
        <p className="mt-1 text-body text-ink-secondary">
          Sends a Clerk invitation with the selected role baked into publicMetadata.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-md border border-error bg-error-100 p-4 text-body text-ink"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Invitation details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteStaffUser} className="space-y-6">
            <Input label="Email" name="email" type="email" required />
            <div>
              <label htmlFor="role" className="mb-2 block text-callout font-semibold text-ink">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="h-14 w-full rounded-sm border border-border-strong bg-card px-4 text-body text-ink"
              >
                <option value="dispatcher">Dispatcher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" size="lg">
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
