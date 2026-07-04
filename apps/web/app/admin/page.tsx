import Link from 'next/link';

import { DashboardCard } from '@/components/business/DashboardCard';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { loadAdminDashboard } from '@/lib/dashboard/loadAdminDashboard';

export const dynamic = 'force-dynamic';

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
    </div>
  );
}
