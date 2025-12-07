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
  unique,
} from "drizzle-orm/pg-core";
import { sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// Role enum as CHECK constraint (Architecture pattern)
const roleCheck = check(
  "role_check",
  sql`role IN ('rider', 'driver', 'family', 'dispatcher', 'admin')`,
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
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (_table) => [roleCheck],
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

// Status check constraints
const rideStatusCheck = check(
  "ride_status_check",
  sql`status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')`,
);

const familyLinkStatusCheck = check(
  "family_link_status_check",
  sql`status IN ('pending', 'approved', 'revoked')`,
);

/**
 * Rides table - Core ride data for RBAC testing and future epics
 * RLS policies will restrict access based on user role
 */
export const rides = pgTable(
  "rides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    riderId: uuid("rider_id")
      .notNull()
      .references(() => users.id),
    driverId: uuid("driver_id").references(() => users.id),
    status: text("status").notNull(),
    pickupAddress: text("pickup_address").notNull(),
    dropoffAddress: text("dropoff_address").notNull(),
    scheduledPickupTime: timestamp("scheduled_pickup_time", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (_table) => [rideStatusCheck],
);

/**
 * Family Links table - Manages family member access to rider data
 * Enables family role to view rides of linked riders
 */
export const familyLinks = pgTable(
  "family_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    riderId: uuid("rider_id")
      .notNull()
      .references(() => users.id),
    familyMemberId: uuid("family_member_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    familyLinkStatusCheck,
    unique("family_link_unique").on(table.riderId, table.familyMemberId),
  ],
);

// Type exports (Architecture requirement)
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
export type Ride = InferSelectModel<typeof rides>;
export type NewRide = InferInsertModel<typeof rides>;
export type FamilyLink = InferSelectModel<typeof familyLinks>;
export type NewFamilyLink = InferInsertModel<typeof familyLinks>;
