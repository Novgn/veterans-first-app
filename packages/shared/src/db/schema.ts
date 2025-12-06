/**
 * Database schema definitions for Veterans First application
 * Uses Drizzle ORM with PostgreSQL (Supabase)
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  check,
} from "drizzle-orm/pg-core";
import { sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// Role enum as CHECK constraint (Architecture pattern)
const roleCheck = check(
  "role_check",
  sql`role IN ('rider', 'driver', 'family', 'dispatcher', 'admin')`
);

/**
 * Users table - Extended by Clerk authentication
 * Stores core user profile information
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    phone: text("phone").unique().notNull(),
    email: text("email"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    role: text("role").notNull(),
    profilePhotoUrl: text("profile_photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (_table) => [roleCheck]
);

/**
 * Audit logs table - HIPAA compliance (FR54, FR55)
 * Tracks all access to PHI and ride modifications
 * NOTE: This table is append-only - no UPDATE or DELETE operations
 */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Type exports (Architecture requirement)
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
