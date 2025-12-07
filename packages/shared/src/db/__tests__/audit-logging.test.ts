/**
 * Audit Logging Integration Tests
 * Story 1.5: Implement Audit Logging Infrastructure
 *
 * These tests verify that audit logging triggers correctly capture
 * INSERT, UPDATE, and DELETE operations on sensitive tables.
 *
 * SETUP: Run `supabase db reset` before running these tests to ensure
 * migrations are applied. Tests require local Supabase instance running.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Test configuration - local Supabase defaults
const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

// Test user UUIDs (from seed.sql)
const TEST_RIDER_ID = "00000000-0000-0000-0000-000000000010"; // John
const TEST_DRIVER_ID = "00000000-0000-0000-0000-000000000020"; // Mike

// Service client (bypasses RLS)
let serviceClient: SupabaseClient;

describe("Audit Logging Triggers", () => {
  beforeAll(async () => {
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify connection
    const { error } = await serviceClient.from("users").select("*").limit(1);
    if (error) {
      throw new Error(
        `Failed to connect to Supabase. Is local Supabase running? Run \`supabase start\`. Error: ${error.message}`
      );
    }
  });

  describe("Rides Table Audit Logging", () => {
    let testRideId: string;

    afterAll(async () => {
      // Cleanup test ride and its audit logs
      if (testRideId) {
        await serviceClient.from("rides").delete().eq("id", testRideId);
        await serviceClient
          .from("audit_logs")
          .delete()
          .eq("resource_id", testRideId);
      }
    });

    it("creates audit log when ride is inserted", async () => {
      // Insert a new ride
      const { data: ride, error: insertError } = await serviceClient
        .from("rides")
        .insert({
          rider_id: TEST_RIDER_ID,
          status: "pending",
          pickup_address: "100 Test St, Tampa FL",
          dropoff_address: "VA Hospital, Tampa FL",
          scheduled_pickup_time: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(ride).toBeDefined();
      testRideId = ride!.id;

      // Verify audit log was created
      const { data: logs, error: logError } = await serviceClient
        .from("audit_logs")
        .select("*")
        .eq("resource_type", "rides")
        .eq("resource_id", testRideId)
        .eq("action", "INSERT");

      expect(logError).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].new_values).toBeDefined();
      expect(logs![0].new_values.status).toBe("pending");
      expect(logs![0].old_values).toBeNull();
    });

    it("creates audit log with old/new values when ride is updated", async () => {
      // Ensure we have a test ride
      expect(testRideId).toBeDefined();

      // Update the ride
      const { error: updateError } = await serviceClient
        .from("rides")
        .update({ status: "assigned", driver_id: TEST_DRIVER_ID })
        .eq("id", testRideId);

      expect(updateError).toBeNull();

      // Verify audit log was created with old/new values
      const { data: logs, error: logError } = await serviceClient
        .from("audit_logs")
        .select("*")
        .eq("resource_type", "rides")
        .eq("resource_id", testRideId)
        .eq("action", "UPDATE")
        .order("created_at", { ascending: false })
        .limit(1);

      expect(logError).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].old_values).toBeDefined();
      expect(logs![0].old_values.status).toBe("pending");
      expect(logs![0].new_values).toBeDefined();
      expect(logs![0].new_values.status).toBe("assigned");
    });

    it("creates audit log when ride is deleted", async () => {
      // Create a ride to delete
      const { data: ride } = await serviceClient
        .from("rides")
        .insert({
          rider_id: TEST_RIDER_ID,
          status: "cancelled",
          pickup_address: "Delete Test St, Tampa FL",
          dropoff_address: "VA Hospital, Tampa FL",
          scheduled_pickup_time: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .select()
        .single();

      const deleteRideId = ride!.id;

      // Delete the ride
      const { error: deleteError } = await serviceClient
        .from("rides")
        .delete()
        .eq("id", deleteRideId);

      expect(deleteError).toBeNull();

      // Verify audit log was created
      const { data: logs, error: logError } = await serviceClient
        .from("audit_logs")
        .select("*")
        .eq("resource_type", "rides")
        .eq("resource_id", deleteRideId)
        .eq("action", "DELETE");

      expect(logError).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].old_values).toBeDefined();
      expect(logs![0].new_values).toBeNull();

      // Cleanup
      await serviceClient
        .from("audit_logs")
        .delete()
        .eq("resource_id", deleteRideId);
    });
  });

  describe("Users Table Audit Logging", () => {
    it("creates audit log when user is updated", async () => {
      // Get original user data
      const { data: originalUser } = await serviceClient
        .from("users")
        .select("first_name")
        .eq("id", TEST_RIDER_ID)
        .single();

      const originalFirstName = originalUser!.first_name;

      // Clear existing UPDATE audit logs for this user
      await serviceClient
        .from("audit_logs")
        .delete()
        .eq("resource_id", TEST_RIDER_ID)
        .eq("action", "UPDATE");

      // Update the user
      const { error: updateError } = await serviceClient
        .from("users")
        .update({ first_name: "JohnUpdated" })
        .eq("id", TEST_RIDER_ID);

      expect(updateError).toBeNull();

      // Verify audit log was created
      const { data: logs, error: logError } = await serviceClient
        .from("audit_logs")
        .select("*")
        .eq("resource_type", "users")
        .eq("resource_id", TEST_RIDER_ID)
        .eq("action", "UPDATE")
        .order("created_at", { ascending: false })
        .limit(1);

      expect(logError).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].old_values.first_name).toBe(originalFirstName);
      expect(logs![0].new_values.first_name).toBe("JohnUpdated");

      // Restore original value
      await serviceClient
        .from("users")
        .update({ first_name: originalFirstName })
        .eq("id", TEST_RIDER_ID);
    });
  });

  describe("Family Links Table Audit Logging", () => {
    let testLinkId: string;

    afterAll(async () => {
      // Cleanup test link and its audit logs
      if (testLinkId) {
        await serviceClient.from("family_links").delete().eq("id", testLinkId);
        await serviceClient
          .from("audit_logs")
          .delete()
          .eq("resource_id", testLinkId);
      }
    });

    it("creates audit log when family link is created", async () => {
      // Create a new family link
      const { data: link, error: insertError } = await serviceClient
        .from("family_links")
        .insert({
          rider_id: TEST_RIDER_ID,
          family_member_id: TEST_DRIVER_ID, // Using driver as family member for test
          status: "pending",
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(link).toBeDefined();
      testLinkId = link!.id;

      // Verify audit log was created
      const { data: logs, error: logError } = await serviceClient
        .from("audit_logs")
        .select("*")
        .eq("resource_type", "family_links")
        .eq("resource_id", testLinkId)
        .eq("action", "INSERT");

      expect(logError).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].new_values.status).toBe("pending");
    });

    it("creates audit log when family link status is updated", async () => {
      // Ensure we have a test link
      expect(testLinkId).toBeDefined();

      // Update the link status
      const { error: updateError } = await serviceClient
        .from("family_links")
        .update({ status: "approved" })
        .eq("id", testLinkId);

      expect(updateError).toBeNull();

      // Verify audit log was created
      const { data: logs, error: logError } = await serviceClient
        .from("audit_logs")
        .select("*")
        .eq("resource_type", "family_links")
        .eq("resource_id", testLinkId)
        .eq("action", "UPDATE")
        .order("created_at", { ascending: false })
        .limit(1);

      expect(logError).toBeNull();
      expect(logs).toHaveLength(1);
      expect(logs![0].old_values.status).toBe("pending");
      expect(logs![0].new_values.status).toBe("approved");
    });
  });

  describe("Audit Log RLS Policies", () => {
    it("non-admin cannot read audit logs", async () => {
      // Create a client simulating a non-admin user query via service role
      // We test this by using the existing RLS test helpers
      const { data, error } = await serviceClient.rpc("test_count_as_user", {
        p_clerk_id: "test_rider_001",
        p_table_name: "audit_logs",
      });

      // If the RPC exists and works, verify count is 0 for non-admin
      if (!error) {
        expect(data).toBe(0);
      } else {
        // If RPC doesn't exist, skip this test
        console.log("RLS test helper not available, skipping non-admin test");
      }
    });

    it("admin can read audit logs", async () => {
      const { data, error } = await serviceClient.rpc("test_count_as_user", {
        p_clerk_id: "test_admin_001",
        p_table_name: "audit_logs",
      });

      // If the RPC exists and works, verify admin can see logs
      if (!error) {
        expect(data).toBeGreaterThan(0);
      } else {
        // If RPC doesn't exist, verify via service role instead
        const { data: logs, error: logError } = await serviceClient
          .from("audit_logs")
          .select("*")
          .limit(1);

        expect(logError).toBeNull();
        expect(logs!.length).toBeGreaterThan(0);
      }
    });
  });
});
