/**
 * Invite staff user (Story 5.16).
 */

import Link from 'next/link';

import { inviteStaffUser } from '@/lib/admin/userActions';

export default async function InviteUserPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
          ← Staff users
        </Link>
        <h2 className="mt-1 text-lg font-semibold">Invite user</h2>
        <p className="text-sm text-zinc-600">
          Sends a Clerk invitation with the selected role baked into publicMetadata.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <form action={inviteStaffUser} className="space-y-3">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-zinc-700">Email</span>
          <input
            name="email"
            type="email"
            required
            className="h-10 rounded-md border border-zinc-300 px-3"
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-zinc-700">Role</span>
          <select name="role" className="h-10 rounded-md border border-zinc-300 px-3">
            <option value="dispatcher">Dispatcher</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          Send invitation
        </button>
      </form>
    </div>
  );
}
