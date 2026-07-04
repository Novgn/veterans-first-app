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
  const db = drizzle(sql);

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
