import { DashboardCard } from '@/components/business/DashboardCard';

export const dynamic = 'force-dynamic';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-2 font-semibold text-ink">Overview</h2>
        <p className="text-body text-ink-secondary">
          Driver roster, credentials, and system configuration.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard title="Active drivers" value="—" hint="Populated by Story 5.2." />
        <DashboardCard title="Pending onboarding" value="—" hint="Populated by Story 5.3." />
        <DashboardCard title="Credential alerts" value="—" hint="Populated by Story 5.9." />
      </div>
    </div>
  );
}
