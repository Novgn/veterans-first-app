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
  decimal,
  boolean,
  smallint,
  time,
  integer,
  date,
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
    // Emergency contact fields (FR71 - Story 2.12)
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    emergencyContactRelationship: text("emergency_contact_relationship"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
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

// Status check constraints
// Ride status progression: pending (booked) -> confirmed -> pending_acceptance -> assigned -> en_route -> arrived -> in_progress -> completed
// pending_acceptance: ride offered to driver, awaiting accept/decline
// en_route: driver heading to pickup (Story 3.4)
const rideStatusCheck = check(
  "ride_status_check",
  sql`status IN ('pending', 'confirmed', 'pending_acceptance', 'assigned', 'en_route', 'in_progress', 'arrived', 'completed', 'cancelled', 'no_show')`
);

const familyLinkStatusCheck = check(
  "family_link_status_check",
  sql`status IN ('pending', 'approved', 'revoked')`
);

/**
 * Driver Profiles table - FR6: Vehicle and driver info for preferred driver feature
 * Stores vehicle information and driver-specific data
 */
export const driverProfiles = pgTable("driver_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: text("vehicle_year"),
  vehicleColor: text("vehicle_color").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  bio: text("bio"),
  yearsExperience: text("years_experience"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/**
 * Rider Preferences table - FR6: Preferred driver settings, FR72: Accessibility preferences
 * Stores rider's default preferred driver preference and accessibility needs
 */
export const riderPreferences = pgTable("rider_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  defaultPreferredDriverId: uuid("default_preferred_driver_id").references(() => users.id),
  // Accessibility preferences (FR72 - Story 2.13)
  mobilityAid: text("mobility_aid"), // 'none', 'cane', 'walker', 'manual_wheelchair', 'power_wheelchair'
  needsDoorAssistance: boolean("needs_door_assistance").default(false),
  needsPackageAssistance: boolean("needs_package_assistance").default(false),
  extraVehicleSpace: boolean("extra_vehicle_space").default(false),
  specialEquipmentNotes: text("special_equipment_notes"),
  // Comfort preferences (FR73 - Story 2.14)
  comfortTemperature: text("comfort_temperature"), // 'cool', 'normal', 'warm'
  conversationPreference: text("conversation_preference"), // 'quiet', 'some', 'chatty'
  musicPreference: text("music_preference"), // 'none', 'soft', 'any'
  otherNotes: text("other_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

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
    preferredDriverId: uuid("preferred_driver_id").references(() => users.id),
    // Story 4.4: populated when a family member books on behalf of a rider.
    // Nullable — null means the rider self-booked (legacy rows also stay null).
    bookedById: uuid("booked_by_id").references(() => users.id),
    status: text("status").notNull(),
    pickupAddress: text("pickup_address").notNull(),
    dropoffAddress: text("dropoff_address").notNull(),
    scheduledPickupTime: timestamp("scheduled_pickup_time", {
      withTimezone: true,
    }).notNull(),
    // Story 3.8: fare in cents (integer) + DB-stamped completed_at timestamp
    fareCents: integer("fare_cents"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (_table) => [rideStatusCheck]
);

/**
 * Permissions stored on a family link. Controls what the linked family
 * member can do once the link reaches `approved` status.
 */
export interface FamilyLinkPermissions {
  view_rides: boolean;
  book_rides: boolean;
  receive_notifications: boolean;
}

export const DEFAULT_FAMILY_LINK_PERMISSIONS: FamilyLinkPermissions = {
  view_rides: true,
  book_rides: false,
  receive_notifications: true,
};

/**
 * Family Links table - Manages family member access to rider data
 * Enables family role to view rides of linked riders.
 *
 * `family_member_id` is nullable so a rider can invite a phone number that
 * isn't a user yet (see `invited_phone`). A CHECK constraint at the DB
 * level guarantees that at least one of the two identifying columns is
 * populated on every row.
 */
export const familyLinks = pgTable(
  "family_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    riderId: uuid("rider_id")
      .notNull()
      .references(() => users.id),
    familyMemberId: uuid("family_member_id").references(() => users.id),
    invitedPhone: text("invited_phone"),
    relationship: text("relationship"),
    permissions: jsonb("permissions").$type<FamilyLinkPermissions>().notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    familyLinkStatusCheck,
    unique("family_link_unique").on(table.riderId, table.familyMemberId),
  ]
);

/**
 * Saved Destinations table - FR3: Save frequently used destinations
 * Enables quick booking with custom-labeled locations
 */
export const savedDestinations = pgTable("saved_destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  label: text("label").notNull(),
  address: text("address").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  placeId: text("place_id"),
  isDefaultPickup: boolean("is_default_pickup").default(false),
  isDefaultDropoff: boolean("is_default_dropoff").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Type exports (Architecture requirement)
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
export type Ride = InferSelectModel<typeof rides>;
export type NewRide = InferInsertModel<typeof rides>;
export type FamilyLink = InferSelectModel<typeof familyLinks>;
export type NewFamilyLink = InferInsertModel<typeof familyLinks>;
export type SavedDestination = InferSelectModel<typeof savedDestinations>;
export type NewSavedDestination = InferInsertModel<typeof savedDestinations>;
export type DriverProfile = InferSelectModel<typeof driverProfiles>;
export type NewDriverProfile = InferInsertModel<typeof driverProfiles>;
export type RiderPreference = InferSelectModel<typeof riderPreferences>;
export type NewRiderPreference = InferInsertModel<typeof riderPreferences>;

/**
 * Driver Locations table - FR11: Real-time driver tracking
 * Stores GPS location data for drivers during active rides
 * Used for rider tracking and fleet management
 */
export const driverLocations = pgTable("driver_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  heading: decimal("heading", { precision: 5, scale: 2 }), // Direction in degrees (0-360)
  accuracy: decimal("accuracy", { precision: 6, scale: 2 }), // GPS accuracy in meters
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
});

export type DriverLocation = InferSelectModel<typeof driverLocations>;
export type NewDriverLocation = InferInsertModel<typeof driverLocations>;

// Ride offer status check constraint
const rideOfferStatusCheck = check(
  "ride_offer_status_check",
  sql`status IN ('pending', 'accepted', 'declined', 'expired')`
);

/**
 * Ride Offers table - FR21: Accept/Decline ride assignments
 * Tracks ride offers to drivers with expiration and response handling
 * Enables two-step assignment: dispatch offers -> driver accepts/declines
 */
export const rideOffers = pgTable(
  "ride_offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rideId: uuid("ride_id")
      .references(() => rides.id, { onDelete: "cascade" })
      .notNull(),
    driverId: uuid("driver_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    offeredAt: timestamp("offered_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("pending"),
    declineReason: text("decline_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (_table) => [rideOfferStatusCheck]
);

export type RideOffer = InferSelectModel<typeof rideOffers>;
export type NewRideOffer = InferInsertModel<typeof rideOffers>;

// Ride event type check constraint
const rideEventTypeCheck = check(
  "ride_event_type_check",
  sql`event_type IN ('en_route', 'arrived', 'trip_started', 'trip_completed', 'no_show', 'cancelled')`
);

/**
 * Ride Events table - FR22, FR47, FR48 (Story 3.4)
 * Records every trip status transition with timestamp + GPS location.
 * Used for audit, driver timeline, and dispatcher fleet view.
 */
export const rideEvents = pgTable(
  "ride_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rideId: uuid("ride_id")
      .references(() => rides.id, { onDelete: "cascade" })
      .notNull(),
    eventType: text("event_type").notNull(),
    driverId: uuid("driver_id").references(() => users.id),
    lat: decimal("lat", { precision: 10, scale: 8 }),
    lng: decimal("lng", { precision: 11, scale: 8 }),
    notes: text("notes"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (_table) => [rideEventTypeCheck]
);

export type RideEvent = InferSelectModel<typeof rideEvents>;
export type NewRideEvent = InferInsertModel<typeof rideEvents>;

/**
 * Driver Availability — Story 3.7
 * Recurring weekly windows when the driver is accepting rides. Day is
 * Sunday=0..Saturday=6 to match JS Date.getDay(). Times are local clock
 * times (the rides themselves already carry timezone-aware timestamps, so
 * the window itself is day-of-week + hours/minutes only).
 */
export const driverAvailability = pgTable("driver_availability", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  dayOfWeek: smallint("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type DriverAvailability = InferSelectModel<typeof driverAvailability>;
export type NewDriverAvailability = InferInsertModel<typeof driverAvailability>;

/**
 * Notification Preferences — Story 4.5
 * Controls which notification channels and types fire for a given user.
 * Expo push token is stored here too (Story 4.8) so the send-notification
 * pipeline can look it up alongside the preference gate.
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  pushEnabled: boolean("push_enabled").notNull().default(true),
  smsEnabled: boolean("sms_enabled").notNull().default(true),
  remindersEnabled: boolean("reminders_enabled").notNull().default(true),
  driverUpdatesEnabled: boolean("driver_updates_enabled").notNull().default(true),
  arrivalPhotosEnabled: boolean("arrival_photos_enabled").notNull().default(true),
  marketingEnabled: boolean("marketing_enabled").notNull().default(false),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type NotificationPreference = InferSelectModel<typeof notificationPreferences>;
export type NewNotificationPreference = InferInsertModel<typeof notificationPreferences>;

/**
 * Canonical default row used when a user has no notification_preferences
 * row yet. Mirrors the DB defaults so server-side dispatch code can gate
 * without a separate "seed on first login" flow.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES_ROW = {
  pushEnabled: true,
  smsEnabled: true,
  remindersEnabled: true,
  driverUpdatesEnabled: true,
  arrivalPhotosEnabled: true,
  marketingEnabled: false,
  pushToken: null as string | null,
} as const;

const notificationChannelCheck = check(
  "notification_channel_check",
  sql`channel IN ('push', 'sms', 'email')`
);

const notificationStatusCheck = check(
  "notification_status_check",
  sql`status IN ('sent', 'delivered', 'failed', 'skipped')`
);

/**
 * Notification Logs — Story 4.6 (append-only).
 * Every dispatch attempt is recorded so reminder/status endpoints can
 * dedupe and support can audit what was actually sent.
 */
export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    rideId: uuid("ride_id").references(() => rides.id, { onDelete: "set null" }),
    notificationType: text("notification_type").notNull(),
    channel: text("channel").notNull(),
    content: text("content").notNull(),
    status: text("status").notNull().default("sent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (_table) => [notificationChannelCheck, notificationStatusCheck]
);

export type NotificationLog = InferSelectModel<typeof notificationLogs>;
export type NewNotificationLog = InferInsertModel<typeof notificationLogs>;

// ---------------------------------------------------------------------------
// Epic 5 — Business Operations & Administration
// ---------------------------------------------------------------------------

const credentialTypeCheck = check(
  "driver_credential_type_check",
  sql`credential_type IN ('drivers_license', 'insurance', 'background_check', 'vehicle_registration')`
);

const credentialStatusCheck = check(
  "driver_credential_status_check",
  sql`verification_status IN ('pending', 'verified', 'rejected', 'expired')`
);

/**
 * Driver Credentials — Stories 5.3 + 5.9
 * Tracks license, insurance, background-check, and vehicle registration.
 * Expiration drives the Story 5.9 alerts job.
 */
export const driverCredentials = pgTable(
  "driver_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    driverId: uuid("driver_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    credentialType: text("credential_type").notNull(),
    credentialNumber: text("credential_number"),
    issuedDate: date("issued_date"),
    expirationDate: date("expiration_date"),
    documentUrl: text("document_url"),
    verificationStatus: text("verification_status").notNull().default("pending"),
    verifiedBy: uuid("verified_by").references(() => users.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (_table) => [credentialTypeCheck, credentialStatusCheck]
);

export type DriverCredential = InferSelectModel<typeof driverCredentials>;
export type NewDriverCredential = InferInsertModel<typeof driverCredentials>;

const invoiceStatusCheck = check(
  "invoice_status_check",
  sql`status IN ('pending', 'paid', 'overdue', 'cancelled')`
);

const invoiceBillingPeriodCheck = check(
  "invoice_billing_period_check",
  sql`billing_period IN ('per_ride', 'weekly', 'monthly')`
);

/**
 * Invoices — Story 5.4
 * One invoice per ride by default; recurring billing (Story 5.6) rolls
 * multiple ride_ids into a single invoice via `invoice_line_items` below.
 */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNumber: text("invoice_number").notNull(),
    riderId: uuid("rider_id")
      .references(() => users.id)
      .notNull(),
    rideId: uuid("ride_id").references(() => rides.id),
    amountCents: integer("amount_cents").notNull(),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    status: text("status").notNull().default("pending"),
    billingPeriod: text("billing_period").notNull().default("per_ride"),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    dueDate: date("due_date").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    invoiceStatusCheck,
    invoiceBillingPeriodCheck,
    unique("invoices_invoice_number_unique").on(table.invoiceNumber),
  ]
);

export type Invoice = InferSelectModel<typeof invoices>;
export type NewInvoice = InferInsertModel<typeof invoices>;

/**
 * Invoice Line Items — Story 5.6
 * Only used when `invoices.billing_period != 'per_ride'`. Per-ride
 * invoices carry a single `ride_id` on the invoice row itself.
 */
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  rideId: uuid("ride_id").references(() => rides.id),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InvoiceLineItem = InferSelectModel<typeof invoiceLineItems>;
export type NewInvoiceLineItem = InferInsertModel<typeof invoiceLineItems>;

const paymentStatusCheck = check(
  "payment_status_check",
  sql`status IN ('pending', 'succeeded', 'failed', 'refunded')`
);

/**
 * Payments — Story 5.5
 * Every Stripe charge lands here. Webhooks move rows from pending -> final.
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .references(() => invoices.id)
      .notNull(),
    riderId: uuid("rider_id")
      .references(() => users.id)
      .notNull(),
    amountCents: integer("amount_cents").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCustomerId: text("stripe_customer_id"),
    status: text("status").notNull().default("pending"),
    paymentMethodType: text("payment_method_type"),
    failureReason: text("failure_reason"),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    refundedAmountCents: integer("refunded_amount_cents"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (_table) => [paymentStatusCheck]
);

export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

/**
 * Rider Payment Accounts — Stories 5.5 / 5.7
 * One row per rider linking to their Stripe customer + default method.
 * Autopay flag + billing frequency configured by Story 5.6.
 */
export const riderPaymentAccounts = pgTable("rider_payment_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  riderId: uuid("rider_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  defaultPaymentMethodId: text("default_payment_method_id"),
  autopayEnabled: boolean("autopay_enabled").notNull().default(false),
  billingFrequency: text("billing_frequency").notNull().default("per_ride"),
  creditBalanceCents: integer("credit_balance_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RiderPaymentAccount = InferSelectModel<typeof riderPaymentAccounts>;
export type NewRiderPaymentAccount = InferInsertModel<typeof riderPaymentAccounts>;

/**
 * Driver Earnings — Story 5.8
 * One row per completed ride with a gross/fee/net split. Export feeds
 * payroll; aggregate feeds financial reports (Story 5.11).
 */
export const driverEarnings = pgTable("driver_earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  driverId: uuid("driver_id")
    .references(() => users.id)
    .notNull(),
  rideId: uuid("ride_id")
    .references(() => rides.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  grossAmountCents: integer("gross_amount_cents").notNull(),
  companyFeeCents: integer("company_fee_cents").notNull(),
  netAmountCents: integer("net_amount_cents").notNull(),
  payPeriodStart: date("pay_period_start"),
  payPeriodEnd: date("pay_period_end"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DriverEarning = InferSelectModel<typeof driverEarnings>;
export type NewDriverEarning = InferInsertModel<typeof driverEarnings>;

/**
 * System Config — Stories 5.13 / 5.14 / 5.15
 * Key/value store for service area, pricing, and operating-hours config.
 */
export const systemConfig = pgTable("system_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  configKey: text("config_key").unique().notNull(),
  configValue: jsonb("config_value").notNull(),
  description: text("description"),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SystemConfig = InferSelectModel<typeof systemConfig>;
export type NewSystemConfig = InferInsertModel<typeof systemConfig>;
