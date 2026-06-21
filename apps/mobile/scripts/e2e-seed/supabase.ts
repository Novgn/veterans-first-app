import { createClient } from '@supabase/supabase-js';
import { TEST_USERS, type TestUser } from '../e2e-seed.config';

const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function upsertUser(u: TestUser, clerkId: string): Promise<string> {
  const { data, error } = await db
    .from('users')
    .upsert(
      {
        clerk_id: clerkId,
        phone: u.phone,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        role: u.role,
      },
      { onConflict: 'clerk_id' }
    )
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
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
  await db.from('saved_destinations').upsert(
    [
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
    ],
    { onConflict: 'user_id,label' }
  );

  await db.from('rides').delete().eq('rider_id', riderId); // reset to a known state
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
  ]);

  // Driver fixtures: profile + Mon/Wed availability.
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
  );
  await db.from('driver_availability').delete().eq('driver_id', driverId);
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
  ]);

  // Family fixture: approved link family → rider.
  await db
    .from('family_links')
    .upsert(
      { rider_id: riderId, family_member_id: familyId, status: 'approved' },
      { onConflict: 'rider_id,family_member_id' }
    );

  console.log('supabase ✓ fixtures complete');
}

export async function teardownSupabase(ids: Map<TestUser['key'], string>): Promise<void> {
  for (const u of TEST_USERS) {
    const clerkId = ids.get(u.key);
    if (clerkId) await db.from('users').delete().eq('clerk_id', clerkId); // FK cascade clears fixtures
  }
  console.log('supabase ✗ users + fixtures removed');
}
