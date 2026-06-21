import { createClient } from '@supabase/supabase-js';
import { TEST_USERS, type TestUser } from '../e2e-seed.config';

const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

function must<T extends { error: unknown }>(res: T): T {
  if (res.error) throw res.error;
  return res;
}

// The clerk-webhook (user.created) may already insert a users row for this
// Clerk id — with role defaulted to 'rider' regardless of publicMetadata.
// Reconcile rather than fight it: clear any stale row holding our phone under a
// different clerk_id, then update the webhook-created row (correcting role/name)
// or insert if absent. Avoids the users_phone_unique collision and fixes roles.
async function upsertUser(u: TestUser, clerkId: string): Promise<string> {
  const fields = {
    clerk_id: clerkId,
    phone: u.phone,
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    role: u.role,
  };

  must(await db.from('users').delete().eq('phone', u.phone).neq('clerk_id', clerkId));

  const updated = must(
    await db.from('users').update(fields).eq('clerk_id', clerkId).select('id').maybeSingle()
  ).data;
  if (updated) return updated.id as string;

  const inserted = must(await db.from('users').insert(fields).select('id').single()).data;
  return inserted.id as string;
}

export async function seedSupabase(ids: Map<TestUser['key'], string>): Promise<void> {
  const dbId: Partial<Record<TestUser['key'], string>> = {};
  for (const u of TEST_USERS) {
    const clerkId = ids.get(u.key);
    if (!clerkId) throw new Error(`missing clerk id for ${u.key}`);
    dbId[u.key] = await upsertUser(u, clerkId);
    console.log(`supabase ✓ user ${u.key} → ${dbId[u.key]}`);
  }

  const riderId = dbId.rider!;
  const driverId = dbId.driver!;
  const familyId = dbId.family!;

  // Rider fixtures: saved places (home/work) + one upcoming + one past ride.
  // saved_destinations has no unique constraint on (user_id, label) — delete then insert.
  must(await db.from('saved_destinations').delete().eq('user_id', riderId));
  must(
    await db.from('saved_destinations').insert([
      {
        user_id: riderId,
        label: 'Home',
        address: '100 Main St',
        lat: 38.8951,
        lng: -77.0364,
        is_default_pickup: true,
      },
      {
        user_id: riderId,
        label: 'VA Clinic',
        address: '50 Medical Center Dr',
        lat: 38.9,
        lng: -77.05,
        is_default_dropoff: true,
      },
    ])
  );

  must(await db.from('rides').delete().eq('rider_id', riderId)); // reset to a known state
  must(
    await db.from('rides').insert([
      {
        rider_id: riderId,
        driver_id: driverId,
        status: 'assigned',
        pickup_address: '100 Main St',
        dropoff_address: '50 Medical Center Dr',
        scheduled_pickup_time: '2026-12-01T15:00:00Z',
      },
      {
        rider_id: riderId,
        driver_id: driverId,
        status: 'completed',
        pickup_address: '100 Main St',
        dropoff_address: '50 Medical Center Dr',
        scheduled_pickup_time: '2026-01-10T15:00:00Z',
      },
    ])
  );

  // Driver fixtures: profile + Mon/Wed availability.
  must(
    await db.from('driver_profiles').upsert(
      {
        user_id: driverId,
        vehicle_make: 'Toyota',
        vehicle_model: 'Sienna',
        vehicle_year: '2022',
        vehicle_color: 'Silver',
        vehicle_plate: 'E2E-1234',
        is_active: true,
      },
      { onConflict: 'user_id' }
    )
  );
  must(await db.from('driver_availability').delete().eq('driver_id', driverId));
  must(
    await db.from('driver_availability').insert([
      {
        driver_id: driverId,
        day_of_week: 1,
        start_time: '08:00',
        end_time: '17:00',
        is_active: true,
      },
      {
        driver_id: driverId,
        day_of_week: 3,
        start_time: '08:00',
        end_time: '17:00',
        is_active: true,
      },
    ])
  );

  // Family fixture: approved link family → rider, WITH book_rides permission so
  // the family book-for-rider flow can reach the booking form (the column
  // defaults to book_rides:false, which hides the "Book a ride" button).
  must(
    await db.from('family_links').upsert(
      {
        rider_id: riderId,
        family_member_id: familyId,
        status: 'approved',
        permissions: { view_rides: true, book_rides: true, receive_notifications: true },
      },
      { onConflict: 'rider_id,family_member_id' }
    )
  );

  console.log('supabase ✓ fixtures complete');
}

export async function teardownSupabase(ids: Map<TestUser['key'], string>): Promise<void> {
  const clerkIds = Array.from(ids.values());
  if (clerkIds.length === 0) return;

  // Resolve our Supabase user ids so dependent rows can be cleared first. The
  // fixture FKs are ON DELETE no action (not cascade), so deleting users while
  // they still have rides/places/links/etc. throws a foreign-key violation.
  const { data: rows } = must(await db.from('users').select('id').in('clerk_id', clerkIds));
  const userIds = (rows ?? []).map((r) => r.id as string);

  if (userIds.length) {
    must(await db.from('rides').delete().in('rider_id', userIds));
    must(await db.from('rides').delete().in('driver_id', userIds));
    must(await db.from('family_links').delete().in('rider_id', userIds));
    must(await db.from('family_links').delete().in('family_member_id', userIds));
    must(await db.from('saved_destinations').delete().in('user_id', userIds));
    must(await db.from('driver_profiles').delete().in('user_id', userIds));
    must(await db.from('driver_availability').delete().in('driver_id', userIds));
  }

  must(await db.from('users').delete().in('clerk_id', clerkIds));
  console.log('supabase ✗ users + fixtures removed');
}
