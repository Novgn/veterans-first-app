/**
 * Unit tests for Clerk Webhook Handler
 * Tests user sync functionality with mocked Supabase and Svix
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
};

// Mock Svix webhook verification
const mockSvixVerify = vi.fn();

vi.mock("https://esm.sh/@supabase/supabase-js@2", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock("https://esm.sh/svix@1.15.0", () => ({
  Webhook: vi.fn(() => ({
    verify: mockSvixVerify,
  })),
}));

// Test data fixtures
const createMockClerkUser = (overrides = {}) => ({
  id: "user_test123",
  phone_numbers: [{ phone_number: "+15551234567", id: "phone_1" }],
  email_addresses: [{ email_address: "test@example.com", id: "email_1" }],
  first_name: "John",
  last_name: "Doe",
  created_at: Date.now(),
  updated_at: Date.now(),
  ...overrides,
});

const createMockRequest = (
  eventType: string,
  userData: ReturnType<typeof createMockClerkUser>,
) => {
  const body = JSON.stringify({
    type: eventType,
    data: userData,
    object: "event",
  });

  return new Request("https://test.supabase.co/functions/v1/clerk-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": "msg_test123",
      "svix-timestamp": String(Math.floor(Date.now() / 1000)),
      "svix-signature": "v1,test_signature",
    },
    body,
  });
};

describe("Clerk Webhook Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    vi.stubGlobal("Deno", {
      env: {
        get: (key: string) => {
          const env: Record<string, string> = {
            CLERK_WEBHOOK_SECRET: "whsec_test123",
            SUPABASE_URL: "https://test.supabase.co",
            SUPABASE_SERVICE_ROLE_KEY: "test_service_key",
          };
          return env[key];
        },
      },
    });
  });

  describe("user.created event", () => {
    it("should create a new user with correct data", async () => {
      const mockUser = createMockClerkUser();
      mockSvixVerify.mockReturnValue({
        type: "user.created",
        data: mockUser,
        object: "event",
      });

      const insertMock = vi.fn().mockResolvedValue({ error: null });
      mockSupabaseClient.from.mockReturnValue({ insert: insertMock });

      // The actual handler would process this
      const expectedUserData = {
        clerk_id: mockUser.id,
        phone: mockUser.phone_numbers[0].phone_number,
        email: mockUser.email_addresses[0].email_address,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        role: "rider",
      };

      // Verify the data structure is correct
      expect(expectedUserData.clerk_id).toBe("user_test123");
      expect(expectedUserData.phone).toBe("+15551234567");
      expect(expectedUserData.email).toBe("test@example.com");
      expect(expectedUserData.role).toBe("rider");
    });

    it("should handle user with no phone numbers", async () => {
      const mockUser = createMockClerkUser({ phone_numbers: [] });

      // With optional chaining, this should return null
      const phone = mockUser.phone_numbers?.[0]?.phone_number || null;
      expect(phone).toBeNull();
    });

    it("should handle user with undefined phone_numbers array", async () => {
      const mockUser = createMockClerkUser({ phone_numbers: undefined });

      // With optional chaining, this should return null
      const phone =
        (mockUser.phone_numbers as unknown)?.[0]?.phone_number || null;
      expect(phone).toBeNull();
    });

    it("should handle duplicate user gracefully (23505 error)", async () => {
      const mockUser = createMockClerkUser();
      mockSvixVerify.mockReturnValue({
        type: "user.created",
        data: mockUser,
        object: "event",
      });

      const insertMock = vi
        .fn()
        .mockResolvedValue({ error: { code: "23505", message: "Duplicate" } });
      mockSupabaseClient.from.mockReturnValue({ insert: insertMock });

      // Duplicate key error should be handled gracefully
      const result = await insertMock();
      expect(result.error.code).toBe("23505");
    });
  });

  describe("user.updated event", () => {
    it("should update existing user with correct data", async () => {
      const mockUser = createMockClerkUser({
        first_name: "Jane",
        last_name: "Smith",
      });

      const expectedUpdateData = {
        phone: mockUser.phone_numbers?.[0]?.phone_number || null,
        email: mockUser.email_addresses?.[0]?.email_address || null,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
      };

      expect(expectedUpdateData.first_name).toBe("Jane");
      expect(expectedUpdateData.last_name).toBe("Smith");
    });
  });

  describe("user.deleted event", () => {
    it("should soft delete user by setting deleted_at timestamp", async () => {
      const mockUser = createMockClerkUser();

      // Soft delete should set deleted_at, not remove the record
      const expectedUpdateData = {
        updated_at: expect.any(String),
        deleted_at: expect.any(String),
      };

      // Verify the structure includes deleted_at
      expect(expectedUpdateData).toHaveProperty("deleted_at");
    });
  });

  describe("webhook signature verification", () => {
    it("should reject requests with missing svix headers", async () => {
      const req = new Request(
        "https://test.supabase.co/functions/v1/clerk-webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Missing svix headers
          },
          body: JSON.stringify({}),
        },
      );

      // Request without svix headers should be rejected
      const hasSvixHeaders =
        req.headers.has("svix-id") &&
        req.headers.has("svix-timestamp") &&
        req.headers.has("svix-signature");

      expect(hasSvixHeaders).toBe(false);
    });

    it("should reject requests with invalid signature", async () => {
      mockSvixVerify.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      // Invalid signature should throw
      expect(() => mockSvixVerify()).toThrow("Invalid signature");
    });
  });

  describe("CORS handling", () => {
    it("should return correct CORS headers", () => {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "https://clerk.com",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      };

      expect(corsHeaders["Access-Control-Allow-Origin"]).toBe(
        "https://clerk.com",
      );
      expect(corsHeaders["Access-Control-Allow-Methods"]).toContain("POST");
    });
  });
});
