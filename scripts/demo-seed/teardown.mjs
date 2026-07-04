#!/usr/bin/env node
/**
 * Reverses scripts/demo-seed/seed.mjs — deletes every row the demo seed
 * created, and nothing else.
 *
 * Finds the demo users via the `clerk_id LIKE 'demo_%'` marker convention,
 * then deletes every child row reachable from those users (in FK-safe,
 * children-first order), then the users themselves.
 *
 * Usage:
 *   DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
 *     node scripts/demo-seed/teardown.mjs
 */

import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Example (local Supabase):\n" +
      "  DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' node scripts/demo-seed/teardown.mjs"
  );
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });

async function deleteDemoChildData(db, demoUserIds) {
  if (demoUserIds.length === 0) return {};
  const counts = {};

  const del = async (label, tag) => {
    const result = await tag;
    counts[label] = result.count;
  };

  // audit_logs is append-only by design, but two audit triggers (0013
  // emergency-contact, 0014 accessibility-preferences) record the
  // *subject's own* user id as the actor, which FK-blocks user deletion.
  // Only rows whose user_id is one of ours are removed here.
  await del("audit_logs", db`DELETE FROM audit_logs WHERE user_id IN ${db(demoUserIds)}`);
  await del(
    "payments",
    db`DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE rider_id IN ${db(demoUserIds)})`
  );
  await del(
    "invoice_line_items",
    db`DELETE FROM invoice_line_items WHERE invoice_id IN (SELECT id FROM invoices WHERE rider_id IN ${db(demoUserIds)})`
  );
  await del("invoices", db`DELETE FROM invoices WHERE rider_id IN ${db(demoUserIds)}`);
  await del(
    "driver_earnings",
    db`DELETE FROM driver_earnings WHERE driver_id IN ${db(demoUserIds)} OR ride_id IN (SELECT id FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)})`
  );
  await del(
    "ride_events",
    db`DELETE FROM ride_events WHERE ride_id IN (SELECT id FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)}) OR driver_id IN ${db(demoUserIds)}`
  );
  await del(
    "ride_offers",
    db`DELETE FROM ride_offers WHERE ride_id IN (SELECT id FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)}) OR driver_id IN ${db(demoUserIds)}`
  );
  await del(
    "driver_locations",
    db`DELETE FROM driver_locations WHERE driver_id IN ${db(demoUserIds)}`
  );
  await del(
    "rides",
    db`DELETE FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)} OR booked_by_id IN ${db(demoUserIds)}`
  );
  await del(
    "driver_credentials",
    db`DELETE FROM driver_credentials WHERE driver_id IN ${db(demoUserIds)}`
  );
  await del(
    "driver_profiles",
    db`DELETE FROM driver_profiles WHERE user_id IN ${db(demoUserIds)}`
  );
  await del(
    "rider_preferences",
    db`DELETE FROM rider_preferences WHERE user_id IN ${db(demoUserIds)}`
  );
  await del(
    "rider_payment_accounts",
    db`DELETE FROM rider_payment_accounts WHERE rider_id IN ${db(demoUserIds)}`
  );

  return counts;
}

async function main() {
  const summary = await sql.begin(async (db) => {
    const demoUsers = await db`SELECT id FROM users WHERE clerk_id LIKE 'demo_%'`;
    const demoUserIds = demoUsers.map((u) => u.id);

    if (demoUserIds.length === 0) {
      return { users: 0, children: {} };
    }

    const children = await deleteDemoChildData(db, demoUserIds);
    const deletedUsers = await db`DELETE FROM users WHERE clerk_id LIKE 'demo_%'`;

    return { users: deletedUsers.count, children };
  });

  console.log("Demo teardown complete:");
  console.log(`  users: ${summary.users}`);
  for (const [table, n] of Object.entries(summary.children)) {
    console.log(`  ${table}: ${n}`);
  }
  if (summary.users === 0) {
    console.log("  (no demo rows found — nothing to do)");
  }
}

main()
  .catch((err) => {
    console.error("Demo teardown failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
