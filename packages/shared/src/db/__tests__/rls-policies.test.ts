/**
 * RLS Policy Integration Tests
 * Story 1.4: Implement Role-Based Access Control (RBAC)
 *
 * These tests verify that RLS policies correctly restrict data access
 * based on user roles. Tests use SQL-based JWT simulation via set_config
 * to properly test RLS policies.
 *
 * SETUP: Run `supabase db reset` before running these tests to ensure
 * seed data is loaded. Tests require local Supabase instance running.
 *
 * NOTE: These tests use the service role to execute SQL with simulated
 * JWT context, which accurately tests the RLS policies.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Test configuration - local Supabase defaults
const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// Test user clerk IDs (from seed.sql)
const TEST_USERS = {
  admin: "test_admin_001",
  dispatcher: "test_dispatcher_001",
  rider1: "test_rider_001", // John - has 4 rides
  rider2: "test_rider_002", // Jane - has 3 rides
  driver1: "test_driver_001", // Mike - assigned to 2 rides
  driver2: "test_driver_002", // Sarah - assigned to 2 rides
  family1: "test_family_001", // Bob - linked to John and Jane
  family2: "test_family_002", // Alice - only pending link
} as const;

// Service client for setup/verification (bypasses RLS)
let serviceClient: SupabaseClient;

/**
 * Executes a query with simulated JWT context for a specific clerk_id.
 * This properly simulates what happens when a user authenticates via Clerk.
 */
async function queryAsUser<T>(
  clerkId: string,
  table: string,
  columns = "*"
): Promise<{ data: T[] | null; error: Error | null }> {
  const { data, error } = await serviceClient.rpc("test_query_as_user", {
    p_clerk_id: clerkId,
    p_table_name: table,
    p_columns: columns,
  });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as T[], error: null };
}

/**
 * Counts visible records for a user in a specific table
 */
async function countAsUser(clerkId: string, table: string): Promise<number> {
  const { data, error } = await serviceClient.rpc("test_count_as_user", {
    p_clerk_id: clerkId,
    p_table_name: table,
  });

  if (error) {
    console.error(`Error counting ${table} for ${clerkId}:`, error);
    return -1;
  }

  return data as number;
}

describe("RLS Policy Tests", () => {
  beforeAll(async () => {
    // Create service client to verify seed data exists
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Create test helper functions
    await serviceClient.rpc("create_rls_test_helpers");

    // Verify seed data is loaded
    const { count, error } = await serviceClient
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error connecting to Supabase:", error);
      throw new Error(
        "Failed to connect to Supabase. Is local Supabase running? Run `supabase start`."
      );
    }

    if (count !== 8) {
      throw new Error(
        `Expected 8 test users, found ${count}. Run \`supabase db reset\` to reload seed data.`
      );
    }
  });

  afterAll(async () => {
    // Clean up test helper functions
    await serviceClient.rpc("drop_rls_test_helpers");
  });

  describe("AC #5: Admin has full access", () => {
    it("admin can see all 8 users", async () => {
      const count = await countAsUser(TEST_USERS.admin, "users");
      expect(count).toBe(8);
    });

    it("admin can see all rides (at least 7 from seed)", async () => {
      const count = await countAsUser(TEST_USERS.admin, "rides");
      // At least 7 from seed, may be more from other test runs
      expect(count).toBeGreaterThanOrEqual(7);
    });

    it("admin can see audit logs (at least 3)", async () => {
      const count = await countAsUser(TEST_USERS.admin, "audit_logs");
      // At least 3 from seed, more with audit triggers generating logs
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe("AC #4: Dispatcher sees all rides", () => {
    it("dispatcher can see all rides (at least 7 from seed)", async () => {
      const count = await countAsUser(TEST_USERS.dispatcher, "rides");
      // At least 7 from seed, may be more from other test runs
      expect(count).toBeGreaterThanOrEqual(7);
    });

    it("dispatcher can see all 8 users", async () => {
      const count = await countAsUser(TEST_USERS.dispatcher, "users");
      expect(count).toBe(8);
    });

    it("dispatcher cannot see audit logs", async () => {
      const count = await countAsUser(TEST_USERS.dispatcher, "audit_logs");
      expect(count).toBe(0);
    });
  });

  describe("AC #1: Rider sees own rides", () => {
    it("rider John can see their rides (at least 4 from seed)", async () => {
      const count = await countAsUser(TEST_USERS.rider1, "rides");
      // At least 4 from seed, may be more from other test runs
      expect(count).toBeGreaterThanOrEqual(4);
    });

    it("rider Jane can see only their 3 rides", async () => {
      const count = await countAsUser(TEST_USERS.rider2, "rides");
      expect(count).toBe(3);
    });

    it("rider can only see their own profile", async () => {
      const count = await countAsUser(TEST_USERS.rider1, "users");
      expect(count).toBe(1);
    });
  });

  describe("AC #2: Driver sees assigned/in_progress rides", () => {
    it("driver Mike can see 2 rides (assigned + in_progress)", async () => {
      const count = await countAsUser(TEST_USERS.driver1, "rides");
      expect(count).toBe(2);
    });

    it("driver Sarah can see 2 rides (assigned + in_progress)", async () => {
      const count = await countAsUser(TEST_USERS.driver2, "rides");
      expect(count).toBe(2);
    });

    it("driver can only see assigned or in_progress status rides", async () => {
      const { data } = await queryAsUser<{ status: string }>(TEST_USERS.driver1, "rides", "status");

      expect(data).not.toBeNull();
      expect(data!.length).toBe(2);

      const statuses = data!.map((r) => r.status);
      expect(statuses.every((s) => ["assigned", "in_progress"].includes(s))).toBe(true);
    });
  });

  describe("AC #3: Family sees linked rider rides", () => {
    it("family Bob can see 7 rides (linked to John + Jane)", async () => {
      const count = await countAsUser(TEST_USERS.family1, "rides");
      expect(count).toBe(7);
    });

    it("family Alice (pending link only) sees 0 rides", async () => {
      const count = await countAsUser(TEST_USERS.family2, "rides");
      expect(count).toBe(0);
    });

    it("family Bob can see his 2 approved family links", async () => {
      const count = await countAsUser(TEST_USERS.family1, "family_links");
      expect(count).toBe(2);
    });
  });

  describe("AC #7: Users table RLS", () => {
    it("regular user can only see own profile", async () => {
      const { data } = await queryAsUser<{ clerk_id: string }>(
        TEST_USERS.rider2,
        "users",
        "clerk_id"
      );

      expect(data).not.toBeNull();
      expect(data!.length).toBe(1);
      expect(data![0].clerk_id).toBe(TEST_USERS.rider2);
    });
  });

  describe("AC #8: Audit logs are append-only", () => {
    it("non-admin cannot read audit logs", async () => {
      const count = await countAsUser(TEST_USERS.rider1, "audit_logs");
      expect(count).toBe(0);
    });

    it("admin can read audit logs (at least 3)", async () => {
      const count = await countAsUser(TEST_USERS.admin, "audit_logs");
      // At least 3 from seed, more with audit triggers generating logs
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it("driver cannot read audit logs", async () => {
      const count = await countAsUser(TEST_USERS.driver1, "audit_logs");
      expect(count).toBe(0);
    });
  });
});
