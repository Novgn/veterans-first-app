import Link from 'next/link';

import { DashboardCard } from '@/components/business/DashboardCard';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDateTime, humanStatus } from '@/lib/format';
import { loadAdminDashboard } from '@/lib/dashboard/loadAdminDashboard';

export const dynamic = 'force-dynamic';

// Ride status → semantic Badge variant, same cues as dispatch/fleet's
// statusVariant: completed/arrived/in_progress read as success, en_route/
// assigned as the neutral "engaged" default, the not-yet-underway statuses
// as a pending warning, and cancelled/no_show as the error cue. Color is
// never the sole signal — the badge always carries the human-readable text.
function rideStatusVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'completed':
    case 'arrived':
    case 'in_progress':
      return 'success';
    case 'en_route':
    case 'assigned':
      return 'default';
    case 'pending':
    case 'confirmed':
    case 'pending_acceptance':
      return 'warning';
    case 'cancelled':
    case 'no_show':
      return 'error';
    default:
      return 'secondary';
  }
}

const QUICK_ACTIONS = [
  {
    href: '/admin/drivers/new',
    title: 'Add driver',
    description: 'Onboard a new driver and start credential verification.',
  },
  {
    href: '/admin/users/invite',
    title: 'Invite staff',
    description: 'Add an admin or dispatcher account.',
  },
  {
    href: '/admin/configuration',
    title: 'Configuration',
    description: 'Service area, pricing, and operating hours.',
  },
] as const;

export default async function AdminHome() {
  const data = await loadAdminDashboard();
  const credentialAlerts = data.expiredCredentialDrivers + data.expiringCredentialDrivers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Overview</h2>
        <p className="text-body text-ink-secondary">
          Driver roster, credentials, and system configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active drivers"
          value={data.activeDrivers.toString()}
          href="/admin/drivers"
        />
        <DashboardCard
          title="Credential alerts"
          value={credentialAlerts.toString()}
          hint={`${data.expiredCredentialDrivers} expired · ${data.expiringCredentialDrivers} expiring ≤30d`}
          href="/admin/credentials"
          badge={
            credentialAlerts > 0 ? (
              <Badge variant={data.expiredCredentialDrivers > 0 ? 'error' : 'warning'}>
                Review
              </Badge>
            ) : undefined
          }
        />
        <DashboardCard
          title="Rides today"
          value={data.ridesToday.toString()}
          hint={`${data.pendingAssignments} pending assignment${data.pendingAssignments === 1 ? '' : 's'}`}
          href="/dispatch/assignments"
        />
        <DashboardCard
          title="Staff accounts"
          value={data.staffCount.toString()}
          hint="Admins + dispatchers"
          href="/admin/users"
        />
      </div>

      <div>
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Quick actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="block">
              <Card className="h-full transition-colors hover:border-border-strong">
                <CardHeader>
                  <CardTitle>{action.title}</CardTitle>
                  <p className="text-callout text-ink-secondary">{action.description}</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border-hairline bg-card shadow-card">
        <div className="flex items-center justify-between gap-2 p-6 pb-4">
          <h3 className="text-title-3 font-semibold text-ink">Recent rides</h3>
          <Link
            href="/dispatch/trip-logs"
            className="text-caption font-semibold text-navy hover:underline"
          >
            View all →
          </Link>
        </div>
        {data.recentRides.length === 0 ? (
          <div className="mx-6 mb-6 rounded-lg border border-dashed border-border-hairline p-6 text-center text-body text-ink-secondary">
            No recent rides yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead className="border-y border-border-hairline text-left">
                <tr className="text-caption font-semibold uppercase tracking-wide text-ink-secondary">
                  <th className="px-6 py-3">Rider</th>
                  <th className="px-6 py-3">Scheduled</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRides.map((ride) => (
                  <tr
                    key={ride.id}
                    className="border-b border-border-hairline text-ink last:border-0"
                  >
                    <td className="px-6 py-3">{ride.riderName}</td>
                    <td className="px-6 py-3 text-ink-secondary">
                      {formatDateTime(ride.scheduledPickupTime)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={rideStatusVariant(ride.status)}>
                        {humanStatus(ride.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
