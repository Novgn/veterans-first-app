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

import { log } from '@/lib/logger';
import { getServerSupabase } from '@/lib/supabase';

export interface RecentRide {
  id: string;
  riderName: string;
  scheduledPickupTime: string | null;
  status: string;
}

export interface AdminDashboardData {
  activeDrivers: number;
  expiredCredentialDrivers: number;
  expiringCredentialDrivers: number;
  ridesToday: number;
  pendingAssignments: number;
  staffCount: number;
  /** 5 most recent rides by created_at, for the Overview "Recent rides" card. */
  recentRides: RecentRide[];
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

interface RiderNameRow {
  first_name: string;
  last_name: string;
}

interface RecentRideRow {
  id: string;
  status: string;
  scheduled_pickup_time: string | null;
  rider: RiderNameRow | RiderNameRow[] | null;
}

export async function loadAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = await getServerSupabase();
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const [driversRes, ridesTodayRes, pendingRes, staffRes, recentRidesRes] = await Promise.all([
    supabase
      .from('users')
      // `driver_credentials` has two FKs to `users` (driver_id, verified_by),
      // so the embed is ambiguous to PostgREST unless disambiguated with
      // `!driver_id` — same hint style as dispatch/fleet/page.tsx's
      // `users!driver_id` on `rides`. Left unresolved, this query returns
      // a PGRST201 error and `driversRes.data` is null, which is why the
      // "Active drivers" and "Credential alerts" tiles used to read 0.
      .select(
        'id, driver_profiles(is_active), driver_credentials!driver_id(credential_type, verification_status, expiration_date)',
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
    supabase
      .from('rides')
      // `rides` has four FKs to `users` (rider_id, driver_id,
      // preferred_driver_id, booked_by_id), so `users(...)` alone is
      // ambiguous — disambiguated with `!rider_id`, same hint style the
      // dispatch pages (fleet/trip-logs/assignments) already use for this
      // exact relationship.
      .select('id, status, scheduled_pickup_time, rider:users!rider_id(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (driversRes.error) {
    log.error(
      { event: 'admin.dashboard.driverQuery.fail', code: driversRes.error.code },
      driversRes.error.message,
    );
  }
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

  if (recentRidesRes.error) {
    log.error(
      { event: 'admin.dashboard.recentRidesQuery.fail', code: recentRidesRes.error.code },
      recentRidesRes.error.message,
    );
  }
  const recentRideRows = (recentRidesRes.data as unknown as RecentRideRow[] | null) ?? [];
  const recentRides: RecentRide[] = recentRideRows.map((row) => {
    const rider = Array.isArray(row.rider) ? (row.rider[0] ?? null) : row.rider;
    return {
      id: row.id,
      riderName: rider ? `${rider.first_name} ${rider.last_name}` : 'Unknown rider',
      scheduledPickupTime: row.scheduled_pickup_time,
      status: row.status,
    };
  });

  return {
    activeDrivers,
    expiredCredentialDrivers,
    expiringCredentialDrivers,
    ridesToday: ridesTodayRes.count ?? 0,
    pendingAssignments: pendingRes.count ?? 0,
    staffCount: staffRes.count ?? 0,
    recentRides,
  };
}
