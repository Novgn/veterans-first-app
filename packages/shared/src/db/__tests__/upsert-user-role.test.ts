/**
 * upsertUser role semantics (webhook role-stomping regression).
 *
 * The Clerk webhook mirrors users into the users table on every
 * user.created/user.updated event. Roles are assigned out-of-band
 * (invitations, admin console), so an upsert WITHOUT a role must
 * never overwrite a stored role — only default it on first insert.
 *
 * Integration test — needs the local Supabase stack (`supabase start`);
 * connects over the session-mode direct port like the other db suites.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";

import { upsertUser } from "../queries";
import * as schema from "../schema";
import { users } from "../schema";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const CLERK_ID = "user_test_upsert_role_semantics";

const identity = {
  clerkId: CLERK_ID,
  phone: "+15555550199",
  email: "upsert-role-test@example.com",
  firstName: "Upsert",
  lastName: "RoleTest",
};

describe("upsertUser role semantics", () => {
  const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });
  // Same shape as getDb() — DbClient is PostgresJsDatabase<typeof schema>.
  const db = drizzle(sql, { schema });

  beforeAll(async () => {
    await db.delete(users).where(eq(users.clerkId, CLERK_ID));
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.clerkId, CLERK_ID));
    await sql.end();
  });

  it("defaults to 'rider' when inserting without a role", async () => {
    const created = await upsertUser(db, identity);
    expect(created.role).toBe("rider");
  });

  it("applies a provided role on update", async () => {
    const updated = await upsertUser(db, { ...identity, role: "admin" });
    expect(updated.role).toBe("admin");
  });

  it("preserves the stored role when updating without a role (no stomping)", async () => {
    const updated = await upsertUser(db, { ...identity, firstName: "Renamed" });
    expect(updated.role).toBe("admin");
    expect(updated.firstName).toBe("Renamed");
  });
});

describe("upsertUser phone-less staff users", () => {
  const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });
  const db = drizzle(sql, { schema });

  const STAFF_A = "user_test_staff_no_phone_a";
  const STAFF_B = "user_test_staff_no_phone_b";

  const cleanup = async () => {
    await db.delete(users).where(eq(users.clerkId, STAFF_A));
    await db.delete(users).where(eq(users.clerkId, STAFF_B));
  };

  beforeAll(cleanup);
  afterAll(async () => {
    await cleanup();
    await sql.end();
  });

  it("allows multiple users without phones (users_phone_unique regression)", async () => {
    // Staff sign in via Google/email — no phone. A '' sentinel used to
    // collide on the UNIQUE phone index for the second such user.
    const a = await upsertUser(db, {
      clerkId: STAFF_A,
      phone: null,
      email: "staff-a@example.com",
      firstName: "Staff",
      lastName: "A",
      role: "admin",
    });
    const b = await upsertUser(db, {
      clerkId: STAFF_B,
      phone: null,
      email: "staff-b@example.com",
      firstName: "Staff",
      lastName: "B",
      role: "dispatcher",
    });
    expect(a.phone).toBeNull();
    expect(b.phone).toBeNull();
    expect(b.role).toBe("dispatcher");
  });
});
