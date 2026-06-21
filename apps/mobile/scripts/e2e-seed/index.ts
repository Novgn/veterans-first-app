import { seedClerkUsers, resolveClerkUserIds, teardownClerkUsers } from './clerk';
import { seedSupabase, teardownSupabase } from './supabase';

async function main() {
  const teardown = process.argv.includes('--teardown');
  if (teardown) {
    const ids = await resolveClerkUserIds();
    await teardownSupabase(ids);
    await teardownClerkUsers();
    console.log('\nteardown complete');
    return;
  }
  const ids = await seedClerkUsers();
  await seedSupabase(ids);
  console.log('\nseed complete — sign in with the test phones (code 424242)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
