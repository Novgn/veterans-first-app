import 'server-only';

/**
 * Admin console dashboard aggregates (Story 5.x console dashboards).
 *
 * Crib of the queries already used by admin/drivers, admin/credentials,
 * admin/users, and the dispatch home — same getServerSupabase() pattern,
 * same "worst credential classification per driver" logic as
 * admin/credentials/page.tsx.
 */

import { classifyCredential } from '@veterans-first/shared/utils';

import { getServerSupabase } from '@/lib/supabase';

export interface AdminDashboardData {
  activeDrivers: number;
  expiredCredentialDrivers: number;
  expiringCredentialDrivers: number;
  ridesToday: number;
  pendingAssignments: number;
  staffCount: number;
}

interface DriverProfileRow {
  is_active: boolean | null;
}

interface DriverCredentialRow {
  credential_type: string;
  verification_status: string;
  expiration_date: string | null;
}

interface DriverRow {
  id: string;
  driver_profiles: DriverProfileRow | DriverProfileRow[] | null;
  driver_credentials: DriverCredentialRow[] | null;
}

export async function loadAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = await getServerSupabase();
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const [driversRes, ridesTodayRes, pendingRes, staffRes] = await Promise.all([
    supabase
      .from('users')
      .select(
        'id, driver_profiles(is_active), driver_credentials(credential_type, verification_status, expiration_date)',
      )
      .eq('role', 'driver'),
    supabase
      .from('rides')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'cancelled')
      .gte('scheduled_pickup_time', todayStart.toISOString())
      .lt('scheduled_pickup_time', todayEnd.toISOString()),
    supabase
      .from('rides')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'pending_acceptance']),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .in('role', ['admin', 'dispatcher']),
  ]);

  const driverRows = (driversRes.data as unknown as DriverRow[] | null) ?? [];
  const today = new Date();

  let activeDrivers = 0;
  let expiredCredentialDrivers = 0;
  let expiringCredentialDrivers = 0;

  for (const row of driverRows) {
    const profile = Array.isArray(row.driver_profiles)
      ? (row.driver_profiles[0] ?? null)
      : row.driver_profiles;
    const isActive = profile?.is_active ?? true;
    if (isActive) activeDrivers += 1;

    // Intentionally tracks only expired / expiring_30_days — the same pair
    // admin/credentials' hasAlerts banner counts; 'unknown' and
    // missing-required-credential states are not alerts there either.
    let worst: 'ok' | 'expiring_30_days' | 'expired' = 'ok';
    for (const c of row.driver_credentials ?? []) {
      const classification = classifyCredential({
        expirationDate: c.expiration_date,
        verificationStatus: c.verification_status,
        today,
      });
      if (classification === 'expired') worst = 'expired';
      else if (classification === 'expiring_30_days' && worst !== 'expired')
        worst = 'expiring_30_days';
    }
    if (worst === 'expired') expiredCredentialDrivers += 1;
    else if (worst === 'expiring_30_days') expiringCredentialDrivers += 1;
  }

  return {
    activeDrivers,
    expiredCredentialDrivers,
    expiringCredentialDrivers,
    ridesToday: ridesTodayRes.count ?? 0,
    pendingAssignments: pendingRes.count ?? 0,
    staffCount: staffRes.count ?? 0,
  };
}
