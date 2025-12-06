/**
 * Database schema type tests
 *
 * These tests verify that:
 * 1. Schema types are correctly inferred by Drizzle
 * 2. Types can be imported without triggering DB connection
 * 3. Schema matches expected structure
 */

import { describe, it, expect } from "vitest";
import type { User, NewUser, AuditLog, NewAuditLog } from "../schema";
import { users, auditLogs } from "../schema";

describe("Database Schema", () => {
  describe("users table", () => {
    it("has correct column definitions", () => {
      // Verify table name
      expect(users._.name).toBe("users");

      // Verify required columns exist
      const columnNames = Object.keys(users);
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("clerkId");
      expect(columnNames).toContain("phone");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("firstName");
      expect(columnNames).toContain("lastName");
      expect(columnNames).toContain("role");
      expect(columnNames).toContain("profilePhotoUrl");
      expect(columnNames).toContain("createdAt");
      expect(columnNames).toContain("updatedAt");
    });

    it("exports correct TypeScript types", () => {
      // Type-level test: these will fail compilation if types are wrong
      const mockUser: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        clerkId: "clerk_123",
        phone: "+15551234567",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "rider",
        profilePhotoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewUser: NewUser = {
        clerkId: "clerk_456",
        phone: "+15559876543",
        firstName: "Jane",
        lastName: "Doe",
        role: "driver",
      };

      expect(mockUser.id).toBeDefined();
      expect(mockNewUser.clerkId).toBeDefined();
    });
  });

  describe("audit_logs table", () => {
    it("has correct column definitions", () => {
      // Verify table name
      expect(auditLogs._.name).toBe("audit_logs");

      // Verify required columns exist
      const columnNames = Object.keys(auditLogs);
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("userId");
      expect(columnNames).toContain("action");
      expect(columnNames).toContain("resourceType");
      expect(columnNames).toContain("resourceId");
      expect(columnNames).toContain("oldValues");
      expect(columnNames).toContain("newValues");
      expect(columnNames).toContain("ipAddress");
      expect(columnNames).toContain("userAgent");
      expect(columnNames).toContain("createdAt");
    });

    it("exports correct TypeScript types", () => {
      const mockAuditLog: AuditLog = {
        id: "123e4567-e89b-12d3-a456-426614174001",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        action: "create",
        resourceType: "ride",
        resourceId: "123e4567-e89b-12d3-a456-426614174002",
        oldValues: null,
        newValues: { status: "requested" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date(),
      };

      const mockNewAuditLog: NewAuditLog = {
        action: "update",
        resourceType: "user",
      };

      expect(mockAuditLog.id).toBeDefined();
      expect(mockNewAuditLog.action).toBeDefined();
    });
  });
});

/**
 * Database Connection Test (Manual)
 *
 * To test actual database connectivity, run this with DATABASE_URL set:
 *
 * ```bash
 * # Set your DATABASE_URL first
 * export DATABASE_URL="postgresql://..."
 *
 * # Then run a connection test
 * npx tsx -e "
 *   import { db } from './packages/shared/src/db';
 *   import { users } from './packages/shared/src/db/schema';
 *   const result = await db.select().from(users).limit(1);
 *   console.log('Connection successful, users table accessible');
 *   process.exit(0);
 * "
 * ```
 */
