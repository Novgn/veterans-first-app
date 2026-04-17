import { DashboardCard } from '@/components/business/DashboardCard';

export const dynamic = 'force-dynamic';

export default function BusinessHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-zinc-600">Financial, compliance, and operational overview.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard title="Revenue this month" value="—" hint="Populated by Story 5.11." />
        <DashboardCard title="Outstanding invoices" value="—" hint="Populated by Story 5.11." />
        <DashboardCard title="Rides this month" value="—" hint="Populated by Story 5.10." />
        <DashboardCard title="Driver payments due" value="—" hint="Populated by Story 5.11." />
        <DashboardCard title="Credential alerts" value="—" hint="Populated by Story 5.9." />
        <DashboardCard title="No-show rate" value="—" hint="Populated by Story 5.10." />
      </div>
    </div>
  );
}
