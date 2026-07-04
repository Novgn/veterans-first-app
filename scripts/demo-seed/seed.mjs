#!/usr/bin/env node
/**
 * Demo data seed for the web consoles (admin / dispatch / business).
 *
 * Populates a realistic, self-contained demo dataset so every console page
 * has something to show: driver roster + credential alerts, ride queues
 * (assignments / confirmations / fleet / no-shows / trip logs), and billing
 * (invoices / payments / driver earnings).
 *
 * DEMO-MARKER CONVENTION (hard rule — see README.md):
 *   Every seeded `users` row has `clerk_id` prefixed `demo_` and an email
 *   like `rider01@demo.vf1st.com`. Every child row is reachable from one of
 *   those users via a foreign key, so teardown.mjs can find and remove
 *   exactly this dataset and nothing else.
 *
 * IDEMPOTENCY: users are upserted on the `clerk_id` unique key (stable ids
 * across runs). Everything else this script creates for those users is
 * deleted and re-inserted fresh on every run (delete-then-insert within the
 * demo set), so running this script N times leaves the same row counts as
 * running it once — never duplicates.
 *
 * NO DEMO STAFF: admin/dispatcher users are never created here. The
 * /admin/users page's row actions call the real Clerk API with `clerk_id`
 * and would 500 against a fake identity.
 *
 * Usage:
 *   DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
 *     node scripts/demo-seed/seed.mjs
 */

import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Example (local Supabase):\n" +
      "  DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' node scripts/demo-seed/seed.mjs"
  );
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });

// ---------------------------------------------------------------------------
// Time helpers — everything is computed relative to "now" so the demo stays
// fresh no matter when it's run. Deterministic (no Math.random): all
// distribution comes from fixed arrays + index arithmetic.
// ---------------------------------------------------------------------------

const NOW = new Date();
const MIN_MS = 60_000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

const plusMinutes = (date, mins) => new Date(date.getTime() + mins * MIN_MS);
const plusHours = (date, hrs) => new Date(date.getTime() + hrs * HOUR_MS);
const plusDays = (date, days) => new Date(date.getTime() + days * DAY_MS);
const isoDate = (date) => date.toISOString().slice(0, 10);
const atUtc = (y, m, d, h = 0, mi = 0) => new Date(Date.UTC(y, m, d, h, mi));

function startOfWeekUtc(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // back up to Sunday
  return d;
}

const THIS_SUNDAY = startOfWeekUtc(NOW);
const PREV_SUNDAY = plusDays(THIS_SUNDAY, -7);
const PREV_SATURDAY = plusDays(THIS_SUNDAY, -1);
const THIS_SATURDAY = plusDays(THIS_SUNDAY, 6);

// ---------------------------------------------------------------------------
// Fixed demo identities
// ---------------------------------------------------------------------------

const RIDERS = [
  { first: "Robert", last: "Hayes" },
  { first: "Dorothy", last: "Simmons" },
  { first: "James", last: "Whitfield" },
  { first: "Linda", last: "Ortiz" },
  { first: "Charles", last: "Nakamura" },
  { first: "Patricia", last: "Boone" },
  { first: "Willie", last: "Freeman" },
  { first: "Margaret", last: "Alvarez" },
].map((r, i) => {
  const n = i + 1;
  const suffix = String(n).padStart(2, "0");
  return {
    idx: i,
    clerkId: `demo_rider_${suffix}`,
    phone: `+1919555${String(n).padStart(4, "0")}`,
    email: `rider${suffix}@demo.vf1st.com`,
    firstName: r.first,
    lastName: r.last,
  };
});

// Emergency contacts for a mix of riders (relationship must match the
// users.emergency_contact_relationship_check constraint).
const EMERGENCY_CONTACTS = {
  0: { name: "Susan Hayes", phone: "+19195559001", relationship: "spouse" },
  2: { name: "Thomas Whitfield", phone: "+19195559003", relationship: "child" },
  4: { name: "Emily Nakamura", phone: "+19195559005", relationship: "caregiver" },
  6: { name: "Deborah Freeman", phone: "+19195559007", relationship: "sibling" },
};

// Accessibility preferences for a couple of riders (mobility_aid_check).
const ACCESSIBILITY_PREFS = {
  1: {
    mobilityAid: "power_wheelchair",
    needsDoorAssistance: true,
    needsPackageAssistance: false,
    extraVehicleSpace: true,
    specialEquipmentNotes:
      "Uses a power wheelchair; requires ramp-equipped vehicle and extra loading time.",
  },
  5: {
    mobilityAid: "cane",
    needsDoorAssistance: true,
    needsPackageAssistance: false,
    extraVehicleSpace: false,
    specialEquipmentNotes: "Uses a cane; prefers driver wait at door until safely seated.",
  },
};

const RIDER_HOME_ADDRESSES = [
  "4210 Bayshore Blvd, Tampa, FL",
  "812 Riverside Dr, Tampa, FL",
  "1590 Oakwood Ave, Tampa, FL",
  "77 Palmetto Ct, Tampa, FL",
  "2245 Hillsborough St, Tampa, FL",
  "390 Bearss Ave, Tampa, FL",
  "6001 Gunn Hwy, Tampa, FL",
  "1502 Cypress Point Dr, Tampa, FL",
];

const VA_DROPOFF_ADDRESSES = [
  "James A. Haley Veterans' Hospital, Tampa, FL",
  "VA Outpatient Clinic, Tampa, FL",
  "Bay Pines VA Healthcare System, Tampa, FL",
  "Tampa VA Pharmacy, Tampa, FL",
];

const DRIVERS = [
  {
    first: "Anthony",
    last: "Russo",
    vehicleMake: "Toyota",
    vehicleModel: "Sienna",
    vehicleYear: "2021",
    vehicleColor: "Silver",
    vehiclePlate: "VF1-1001",
    bio: "Army veteran, 6 years driving medical transport.",
    yearsExperience: "6",
    isActive: true,
  },
  {
    first: "Denise",
    last: "Coleman",
    vehicleMake: "Honda",
    vehicleModel: "Odyssey",
    vehicleYear: "2022",
    vehicleColor: "Blue",
    vehiclePlate: "VF1-1002",
    bio: "Former EMT, specializes in mobility-assist transport.",
    yearsExperience: "4",
    isActive: true,
  },
  {
    first: "Miguel",
    last: "Torres",
    vehicleMake: "Chrysler",
    vehicleModel: "Pacifica",
    vehicleYear: "2020",
    vehicleColor: "White",
    vehiclePlate: "VF1-1003",
    bio: "Retired Navy, 8 years rideshare experience.",
    yearsExperience: "8",
    isActive: true,
  },
  {
    first: "Karen",
    last: "O'Brien",
    vehicleMake: "Ford",
    vehicleModel: "Transit Connect",
    vehicleYear: "2019",
    vehicleColor: "Black",
    vehiclePlate: "VF1-1004",
    bio: "On leave; returning next quarter.",
    yearsExperience: "5",
    isActive: false,
  },
].map((d, i) => {
  const n = i + 1;
  const suffix = String(n).padStart(2, "0");
  return {
    idx: i,
    clerkId: `demo_driver_${suffix}`,
    phone: `+1919555${String(1000 + n).padStart(4, "0")}`,
    email: `driver${suffix}@demo.vf1st.com`,
    firstName: d.first,
    lastName: d.last,
    ...d,
  };
});

const ACTIVE_DRIVER_IDXS = [0, 1, 2]; // driver 3 (idx 3) is inactive

// Credential plan per driver — mostly valid; driver 1 (Denise) has ONE
// credential expiring within 30 days, driver 2 (Miguel) has ONE expired.
const CREDENTIAL_PLANS = [
  [
    { type: "drivers_license", issuedDaysAgo: 1095, expiresInDays: 730 },
    { type: "insurance", issuedDaysAgo: 365, expiresInDays: 335 },
    { type: "background_check", issuedDaysAgo: 365, expiresInDays: 730 },
    { type: "vehicle_registration", issuedDaysAgo: 365, expiresInDays: 240 },
  ],
  [
    { type: "drivers_license", issuedDaysAgo: 800, expiresInDays: 540 },
    { type: "insurance", issuedDaysAgo: 350, expiresInDays: 15 }, // expiring <30d
    { type: "background_check", issuedDaysAgo: 400, expiresInDays: 730 },
    { type: "vehicle_registration", issuedDaysAgo: 300, expiresInDays: 300 },
  ],
  [
    { type: "drivers_license", issuedDaysAgo: 1000, expiresInDays: -10 }, // expired
    { type: "insurance", issuedDaysAgo: 270, expiresInDays: 270 },
    { type: "background_check", issuedDaysAgo: 400, expiresInDays: 730 },
    { type: "vehicle_registration", issuedDaysAgo: 210, expiresInDays: 210 },
  ],
  [
    { type: "drivers_license", issuedDaysAgo: 900, expiresInDays: 460 },
    { type: "insurance", issuedDaysAgo: 300, expiresInDays: 300 },
    { type: "background_check", issuedDaysAgo: 500, expiresInDays: 600 },
    { type: "vehicle_registration", issuedDaysAgo: 200, expiresInDays: 330 },
  ],
];

// ---------------------------------------------------------------------------
// Ride construction (all deterministic — fixed arrays + index arithmetic,
// no Math.random)
// ---------------------------------------------------------------------------

function buildHistoryRides() {
  // Index 0 = current month .. 5 = five months ago. Front-loaded so the
  // current month is heaviest (feeds the 30d/7d operational windows).
  // Sized so each month's completed fares sum to ~$450-$650 — that sum
  // becomes the month's consolidated PAID invoice, which is what the
  // business dashboard's 6-bar monthly revenue chart plots.
  const MONTH_COUNTS = [24, 18, 17, 18, 17, 18]; // sum = 112
  const rides = [];
  let globalIndex = 0;

  for (let m = 0; m < MONTH_COUNTS.length; m++) {
    const monthStart = atUtc(NOW.getUTCFullYear(), NOW.getUTCMonth() - m, 1);
    const daysInMonth = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)
    ).getUTCDate();
    const count = MONTH_COUNTS[m];
    // Current month: never schedule beyond "yesterday" so history stays in the past.
    const maxDay = m === 0 ? Math.max(1, NOW.getUTCDate() - 1) : daysInMonth;

    for (let i = 0; i < count; i++) {
      const dayOfMonth = Math.min(
        maxDay,
        1 + Math.floor((i * Math.max(1, maxDay - 1)) / Math.max(1, count - 1))
      );
      const hour = 8 + (i % 9); // 8am - 4pm
      const minute = (i * 11) % 60;
      const scheduledPickupTime = atUtc(
        monthStart.getUTCFullYear(),
        monthStart.getUTCMonth(),
        dayOfMonth,
        hour,
        minute
      );

      const riderIdx = globalIndex % RIDERS.length;
      const driverIdx = ACTIVE_DRIVER_IDXS[globalIndex % ACTIVE_DRIVER_IDXS.length];
      const isCancelled = globalIndex % 9 === 8; // ~11% cancelled, rest completed
      const fareCents = 1800 + ((globalIndex * 173 + m * 97) % 2701); // $18.00 - $45.00
      const durationMinutes = 30 + (globalIndex % 20);
      const arrivedOffsetMinutes = (globalIndex % 7) - 2; // -2..+4 minutes off schedule

      rides.push({
        tag: "history",
        monthIndex: m,
        riderIdx,
        driverIdx: isCancelled ? null : driverIdx,
        status: isCancelled ? "cancelled" : "completed",
        pickupAddress: RIDER_HOME_ADDRESSES[riderIdx],
        dropoffAddress: VA_DROPOFF_ADDRESSES[globalIndex % VA_DROPOFF_ADDRESSES.length],
        scheduledPickupTime,
        fareCents: isCancelled ? null : fareCents,
        completedAt: isCancelled ? null : plusMinutes(scheduledPickupTime, durationMinutes),
        arrivedOffsetMinutes: isCancelled ? null : arrivedOffsetMinutes,
      });
      globalIndex++;
    }
  }
  return rides;
}

function buildEarningsAnchorRides() {
  // 2 completed rides per active driver per pay period (previous week =
  // paid; current week-to-date = pending payout). Always safely in the
  // past relative to NOW regardless of what day the script runs.
  const rides = [];
  ACTIVE_DRIVER_IDXS.forEach((driverIdx, di) => {
    const riderIdxA = (driverIdx * 2) % RIDERS.length;
    const riderIdxB = (driverIdx * 2 + 1) % RIDERS.length;

    // Previous week: Tue 10:00 and Thu 14:00.
    const prevTue = plusHours(plusDays(PREV_SUNDAY, 2), 10);
    const prevThu = plusHours(plusDays(PREV_SUNDAY, 4), 14);
    // Current (week-to-date): yesterday 10:00 and 3 hours ago — both always in the past.
    const yesterday10am = atUtc(
      NOW.getUTCFullYear(),
      NOW.getUTCMonth(),
      NOW.getUTCDate() - 1,
      10,
      0
    );
    const threeHoursAgo = plusHours(NOW, -3);

    [
      { period: "previous", scheduledPickupTime: prevTue, fareBase: 2200 + di * 300 },
      { period: "previous", scheduledPickupTime: prevThu, fareBase: 2600 + di * 300 },
      { period: "current", scheduledPickupTime: yesterday10am, fareBase: 2400 + di * 300 },
      { period: "current", scheduledPickupTime: threeHoursAgo, fareBase: 2800 + di * 300 },
    ].forEach((r, i) => {
      rides.push({
        tag: `earnings-${r.period}`,
        driverIdx,
        riderIdx: i % 2 === 0 ? riderIdxA : riderIdxB,
        status: "completed",
        pickupAddress: RIDER_HOME_ADDRESSES[i % 2 === 0 ? riderIdxA : riderIdxB],
        dropoffAddress: VA_DROPOFF_ADDRESSES[(driverIdx + i) % VA_DROPOFF_ADDRESSES.length],
        scheduledPickupTime: r.scheduledPickupTime,
        fareCents: r.fareBase,
        completedAt: plusMinutes(r.scheduledPickupTime, 40),
        arrivedOffsetMinutes: 2,
        earningsPeriod: r.period,
      });
    });
  });
  return rides;
}

function buildBillingAnchorRides() {
  // One completed ride per current-period per-ride invoice (pending /
  // overdue), ridden by riders 1 and 2. Paid revenue comes from the six
  // monthly consolidated invoices built from history rides instead.
  return [
    {
      tag: "billing-pending",
      riderIdx: 1,
      driverIdx: 1,
      status: "completed",
      pickupAddress: RIDER_HOME_ADDRESSES[1],
      dropoffAddress: VA_DROPOFF_ADDRESSES[1],
      scheduledPickupTime: plusDays(NOW, -5),
      fareCents: 2450,
      completedAt: plusMinutes(plusDays(NOW, -5), 42),
      arrivedOffsetMinutes: 3,
    },
    {
      tag: "billing-overdue",
      riderIdx: 2,
      driverIdx: 2,
      status: "completed",
      pickupAddress: RIDER_HOME_ADDRESSES[2],
      dropoffAddress: VA_DROPOFF_ADDRESSES[2],
      scheduledPickupTime: plusDays(NOW, -35),
      fareCents: 4100,
      completedAt: plusMinutes(plusDays(NOW, -35), 38),
      arrivedOffsetMinutes: -1,
    },
  ];
}

function buildNearTermRides() {
  const rides = [];

  // 3 pending, further out than 24h — assignments queue only.
  [3, 5, 8].forEach((daysOut, i) => {
    const riderIdx = [0, 3, 6][i];
    rides.push({
      tag: "pending-far",
      riderIdx,
      driverIdx: null,
      status: "pending",
      pickupAddress: RIDER_HOME_ADDRESSES[riderIdx],
      dropoffAddress: VA_DROPOFF_ADDRESSES[i % VA_DROPOFF_ADDRESSES.length],
      scheduledPickupTime: plusHours(plusDays(NOW, daysOut), 10),
      fareCents: null,
      completedAt: null,
      arrivedOffsetMinutes: null,
    });
  });

  // 2 assigned (today, a few hours out) — assignments + fleet queues.
  [
    { hoursOut: 3, driverIdx: 0, riderIdx: 1 },
    { hoursOut: 7, driverIdx: 1, riderIdx: 4 },
  ].forEach(({ hoursOut, driverIdx, riderIdx }) => {
    rides.push({
      tag: "assigned",
      riderIdx,
      driverIdx,
      status: "assigned",
      pickupAddress: RIDER_HOME_ADDRESSES[riderIdx],
      dropoffAddress: VA_DROPOFF_ADDRESSES[riderIdx % VA_DROPOFF_ADDRESSES.length],
      scheduledPickupTime: plusHours(NOW, hoursOut),
      fareCents: null,
      completedAt: null,
      arrivedOffsetMinutes: null,
    });
  });

  // 1 en_route (driver on the way) — fleet queue.
  rides.push({
    tag: "en_route",
    riderIdx: 2,
    driverIdx: 2,
    status: "en_route",
    pickupAddress: RIDER_HOME_ADDRESSES[2],
    dropoffAddress: VA_DROPOFF_ADDRESSES[2 % VA_DROPOFF_ADDRESSES.length],
    scheduledPickupTime: plusMinutes(NOW, 15),
    fareCents: null,
    completedAt: null,
    arrivedOffsetMinutes: null,
  });

  // 2 no_show, with ride_events notes — no-show queue.
  [
    {
      hoursAgo: 3,
      driverIdx: 0,
      riderIdx: 5,
      notes:
        "Rider did not come outside after 10 minutes of waiting; called twice, no answer.",
    },
    {
      daysAgo: 1,
      driverIdx: 1,
      riderIdx: 7,
      notes: "No one answered the door; neighbor said rider left earlier by other means.",
    },
  ].forEach((r) => {
    const scheduledPickupTime = r.daysAgo
      ? plusDays(NOW, -r.daysAgo)
      : plusHours(NOW, -r.hoursAgo);
    rides.push({
      tag: "no_show",
      riderIdx: r.riderIdx,
      driverIdx: r.driverIdx,
      status: "no_show",
      pickupAddress: RIDER_HOME_ADDRESSES[r.riderIdx],
      dropoffAddress: VA_DROPOFF_ADDRESSES[r.riderIdx % VA_DROPOFF_ADDRESSES.length],
      scheduledPickupTime,
      fareCents: null,
      completedAt: null,
      arrivedOffsetMinutes: null,
      noShowNotes: r.notes,
      noShowAt: plusMinutes(scheduledPickupTime, 15),
    });
  });

  // 3 scheduled tomorrow — confirmations queue (next 24h).
  [9, 13, 17].forEach((hour, i) => {
    const riderIdx = [1, 4, 7][i];
    rides.push({
      tag: "confirm-tomorrow",
      riderIdx,
      driverIdx: null,
      status: "pending",
      pickupAddress: RIDER_HOME_ADDRESSES[riderIdx],
      dropoffAddress: VA_DROPOFF_ADDRESSES[i % VA_DROPOFF_ADDRESSES.length],
      scheduledPickupTime: atUtc(
        NOW.getUTCFullYear(),
        NOW.getUTCMonth(),
        NOW.getUTCDate() + 1,
        hour,
        0
      ),
      fareCents: null,
      completedAt: null,
      arrivedOffsetMinutes: null,
    });
  });

  return rides;
}

// ---------------------------------------------------------------------------
// Cleanup — deletes every child row reachable from the demo users, in
// FK-safe (children-first) order. Shared shape with teardown.mjs.
//
// audit_logs is included even though it's designed as an append-only HIPAA
// trail: two of the audit triggers (0013 emergency-contact, 0014
// accessibility-preferences) record the *subject's own* user id as the
// actor (`user_id`), not the acting admin's. Re-inserting rider_preferences
// on every seed run re-fires the accessibility INSERT trigger every time,
// so without this cleanup those rows accumulate and FK-block user deletion
// in teardown. Only rows whose `user_id` is one of ours are removed —
// audit rows that merely reference a demo resource_id (no FK on that
// column) are left alone.
// ---------------------------------------------------------------------------

async function deleteDemoChildData(db, demoUserIds) {
  if (demoUserIds.length === 0) return;
  await db`DELETE FROM audit_logs WHERE user_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE rider_id IN ${db(demoUserIds)})`;
  await db`DELETE FROM invoice_line_items WHERE invoice_id IN (SELECT id FROM invoices WHERE rider_id IN ${db(demoUserIds)})`;
  await db`DELETE FROM invoices WHERE rider_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM driver_earnings WHERE driver_id IN ${db(demoUserIds)} OR ride_id IN (SELECT id FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)})`;
  await db`DELETE FROM ride_events WHERE ride_id IN (SELECT id FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)}) OR driver_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM ride_offers WHERE ride_id IN (SELECT id FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)}) OR driver_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM driver_locations WHERE driver_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM rides WHERE rider_id IN ${db(demoUserIds)} OR driver_id IN ${db(demoUserIds)} OR booked_by_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM driver_credentials WHERE driver_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM driver_profiles WHERE user_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM rider_preferences WHERE user_id IN ${db(demoUserIds)}`;
  await db`DELETE FROM rider_payment_accounts WHERE rider_id IN ${db(demoUserIds)}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const counts = {};

  await sql.begin(async (db) => {
    // --- Users (upsert on clerk_id — stable ids across runs) -------------
    const userRows = [
      ...RIDERS.map((r) => ({
        clerk_id: r.clerkId,
        phone: r.phone,
        email: r.email,
        first_name: r.firstName,
        last_name: r.lastName,
        role: "rider",
        emergency_contact_name: EMERGENCY_CONTACTS[r.idx]?.name ?? null,
        emergency_contact_phone: EMERGENCY_CONTACTS[r.idx]?.phone ?? null,
        emergency_contact_relationship: EMERGENCY_CONTACTS[r.idx]?.relationship ?? null,
      })),
      ...DRIVERS.map((d) => ({
        clerk_id: d.clerkId,
        phone: d.phone,
        email: d.email,
        first_name: d.firstName,
        last_name: d.lastName,
        role: "driver",
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relationship: null,
      })),
    ];

    const insertedUsers = await db`
      INSERT INTO users ${db(
        userRows,
        "clerk_id",
        "phone",
        "email",
        "first_name",
        "last_name",
        "role",
        "emergency_contact_name",
        "emergency_contact_phone",
        "emergency_contact_relationship"
      )}
      ON CONFLICT (clerk_id) DO UPDATE SET
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        emergency_contact_phone = EXCLUDED.emergency_contact_phone,
        emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
        updated_at = now()
      RETURNING id, clerk_id
    `;

    const idByClerkId = new Map(insertedUsers.map((u) => [u.clerk_id, u.id]));
    const riderId = (idx) => idByClerkId.get(RIDERS[idx].clerkId);
    const driverId = (idx) => idByClerkId.get(DRIVERS[idx].clerkId);
    const demoUserIds = insertedUsers.map((u) => u.id);

    counts.users = insertedUsers.length;

    // --- Clean slate for everything else this dataset owns ---------------
    await deleteDemoChildData(db, demoUserIds);

    // --- driver_profiles ---------------------------------------------------
    const driverProfileRows = DRIVERS.map((d) => ({
      user_id: driverId(d.idx),
      vehicle_make: d.vehicleMake,
      vehicle_model: d.vehicleModel,
      vehicle_year: d.vehicleYear,
      vehicle_color: d.vehicleColor,
      vehicle_plate: d.vehiclePlate,
      bio: d.bio,
      years_experience: d.yearsExperience,
      is_active: d.isActive,
    }));
    await db`
      INSERT INTO driver_profiles ${db(
        driverProfileRows,
        "user_id",
        "vehicle_make",
        "vehicle_model",
        "vehicle_year",
        "vehicle_color",
        "vehicle_plate",
        "bio",
        "years_experience",
        "is_active"
      )}
      ON CONFLICT (user_id) DO UPDATE SET
        vehicle_make = EXCLUDED.vehicle_make,
        vehicle_model = EXCLUDED.vehicle_model,
        vehicle_year = EXCLUDED.vehicle_year,
        vehicle_color = EXCLUDED.vehicle_color,
        vehicle_plate = EXCLUDED.vehicle_plate,
        bio = EXCLUDED.bio,
        years_experience = EXCLUDED.years_experience,
        is_active = EXCLUDED.is_active,
        updated_at = now()
    `;
    counts.driver_profiles = driverProfileRows.length;

    // --- driver_credentials --------------------------------------------
    const credentialRows = [];
    CREDENTIAL_PLANS.forEach((plan, driverIdx) => {
      plan.forEach((c) => {
        const expirationDate = plusDays(NOW, c.expiresInDays);
        credentialRows.push({
          driver_id: driverId(driverIdx),
          credential_type: c.type,
          credential_number: `${c.type.slice(0, 3).toUpperCase()}-D${driverIdx + 1}`,
          issued_date: isoDate(plusDays(NOW, -c.issuedDaysAgo)),
          expiration_date: isoDate(expirationDate),
          verification_status: "verified",
        });
      });
    });
    await db`
      INSERT INTO driver_credentials ${db(
        credentialRows,
        "driver_id",
        "credential_type",
        "credential_number",
        "issued_date",
        "expiration_date",
        "verification_status"
      )}
    `;
    counts.driver_credentials = credentialRows.length;

    // --- rider_preferences (accessibility) ------------------------------
    const riderPrefRows = Object.entries(ACCESSIBILITY_PREFS).map(([idx, p]) => ({
      user_id: riderId(Number(idx)),
      mobility_aid: p.mobilityAid,
      needs_door_assistance: p.needsDoorAssistance,
      needs_package_assistance: p.needsPackageAssistance,
      extra_vehicle_space: p.extraVehicleSpace,
      special_equipment_notes: p.specialEquipmentNotes,
    }));
    await db`
      INSERT INTO rider_preferences ${db(
        riderPrefRows,
        "user_id",
        "mobility_aid",
        "needs_door_assistance",
        "needs_package_assistance",
        "extra_vehicle_space",
        "special_equipment_notes"
      )}
      ON CONFLICT (user_id) DO UPDATE SET
        mobility_aid = EXCLUDED.mobility_aid,
        needs_door_assistance = EXCLUDED.needs_door_assistance,
        needs_package_assistance = EXCLUDED.needs_package_assistance,
        extra_vehicle_space = EXCLUDED.extra_vehicle_space,
        special_equipment_notes = EXCLUDED.special_equipment_notes,
        updated_at = now()
    `;
    counts.rider_preferences = riderPrefRows.length;

    // --- Rides (per-row insert so we reliably get each row's new id back) --
    const allRideDescriptors = [
      ...buildHistoryRides(),
      ...buildEarningsAnchorRides(),
      ...buildBillingAnchorRides(),
      ...buildNearTermRides(),
    ];

    for (const ride of allRideDescriptors) {
      const [{ id }] = await db`
        INSERT INTO rides (
          rider_id, driver_id, status, pickup_address, dropoff_address,
          scheduled_pickup_time, fare_cents, completed_at
        ) VALUES (
          ${riderId(ride.riderIdx)},
          ${ride.driverIdx == null ? null : driverId(ride.driverIdx)},
          ${ride.status},
          ${ride.pickupAddress},
          ${ride.dropoffAddress},
          ${ride.scheduledPickupTime.toISOString()},
          ${ride.fareCents},
          ${ride.completedAt ? ride.completedAt.toISOString() : null}
        )
        RETURNING id
      `;
      ride.dbId = id;
    }
    counts.rides = allRideDescriptors.length;

    // --- ride_events ('arrived' for completed rides, 'no_show' notes) ----
    const rideEventRows = [];
    for (const ride of allRideDescriptors) {
      if (ride.status === "completed" && ride.arrivedOffsetMinutes != null) {
        rideEventRows.push({
          ride_id: ride.dbId,
          event_type: "arrived",
          driver_id: ride.driverIdx == null ? null : driverId(ride.driverIdx),
          notes: null,
          created_at: plusMinutes(ride.scheduledPickupTime, ride.arrivedOffsetMinutes).toISOString(),
        });
      }
      if (ride.tag === "no_show") {
        rideEventRows.push({
          ride_id: ride.dbId,
          event_type: "no_show",
          driver_id: ride.driverIdx == null ? null : driverId(ride.driverIdx),
          notes: ride.noShowNotes,
          created_at: ride.noShowAt.toISOString(),
        });
      }
    }
    await db`
      INSERT INTO ride_events ${db(rideEventRows, "ride_id", "event_type", "driver_id", "notes", "created_at")}
    `;
    counts.ride_events = rideEventRows.length;

    // Reflect no_show event timing on the ride's updated_at (no-shows page
    // sorts by updated_at) — cheap per-row update, only 2 rows.
    for (const ride of allRideDescriptors) {
      if (ride.tag === "no_show") {
        await db`UPDATE rides SET updated_at = ${ride.noShowAt.toISOString()} WHERE id = ${ride.dbId}`;
      }
    }

    // --- driver_locations (GPS fixes for drivers on active-ish rides) ----
    const activeRides = allRideDescriptors.filter((r) =>
      ["assigned", "en_route"].includes(r.status)
    );
    const BASE_LAT = 27.9506;
    const BASE_LNG = -82.4572;
    const locationRows = [];
    activeRides.forEach((ride, i) => {
      const lat = BASE_LAT + (i - 1) * 0.01;
      const lng = BASE_LNG + (i - 1) * 0.012;
      const heading = [90, 180, 270][i % 3];
      locationRows.push(
        {
          driver_id: driverId(ride.driverIdx),
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          heading,
          accuracy: 12.5,
          recorded_at: plusMinutes(NOW, -20).toISOString(),
        },
        {
          driver_id: driverId(ride.driverIdx),
          latitude: (lat + 0.001).toFixed(6),
          longitude: (lng + 0.001).toFixed(6),
          heading,
          accuracy: 9.0,
          recorded_at: plusMinutes(NOW, -2).toISOString(),
        }
      );
    });
    if (locationRows.length > 0) {
      await db`
        INSERT INTO driver_locations ${db(
          locationRows,
          "driver_id",
          "latitude",
          "longitude",
          "heading",
          "accuracy",
          "recorded_at"
        )}
      `;
    }
    counts.driver_locations = locationRows.length;

    // --- driver_earnings (current + previous pay period, 3 active drivers) --
    const earningsRows = [];
    for (const ride of allRideDescriptors) {
      if (!ride.tag.startsWith("earnings-")) continue;
      const gross = ride.fareCents;
      const fee = Math.round(gross * 0.2);
      const net = gross - fee;
      const isPrevious = ride.earningsPeriod === "previous";
      earningsRows.push({
        driver_id: driverId(ride.driverIdx),
        ride_id: ride.dbId,
        gross_amount_cents: gross,
        company_fee_cents: fee,
        net_amount_cents: net,
        pay_period_start: isoDate(isPrevious ? PREV_SUNDAY : THIS_SUNDAY),
        pay_period_end: isoDate(isPrevious ? PREV_SATURDAY : THIS_SATURDAY),
        paid_at: isPrevious ? plusDays(ride.completedAt, 2).toISOString() : null,
        created_at: ride.completedAt.toISOString(),
      });
    }
    await db`
      INSERT INTO driver_earnings ${db(
        earningsRows,
        "driver_id",
        "ride_id",
        "gross_amount_cents",
        "company_fee_cents",
        "net_amount_cents",
        "pay_period_start",
        "pay_period_end",
        "paid_at",
        "created_at"
      )}
    `;
    counts.driver_earnings = earningsRows.length;

    // --- Invoices ----------------------------------------------------------
    // 8 total: 6 monthly consolidated PAID invoices — one per month of the
    // business dashboard's 6-bar revenue chart window, amount = that
    // month's completed history-ride fares (one line item per ride, one
    // succeeded payment dated in-month) — plus the current-period per-ride
    // PENDING and OVERDUE invoices.
    const lineItemRows = [];
    const paymentRows = [];

    // Group completed history rides by month index (0 = current .. 5).
    const historyByMonth = new Map();
    for (const ride of allRideDescriptors) {
      if (ride.tag !== "history" || ride.status !== "completed") continue;
      const list = historyByMonth.get(ride.monthIndex) ?? [];
      list.push(ride);
      historyByMonth.set(ride.monthIndex, list);
    }

    let invoiceCount = 0;
    for (let m = 5; m >= 0; m--) {
      const monthRides = historyByMonth.get(m) ?? [];
      if (monthRides.length === 0) continue; // can't happen with MONTH_COUNTS, but be safe

      const monthStart = atUtc(NOW.getUTCFullYear(), NOW.getUTCMonth() - m, 1);
      const monthEnd = atUtc(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0); // last day of month
      const monthKey = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}`;
      const monthLabel = monthStart.toLocaleString("en-US", { month: "long", timeZone: "UTC" });

      const amount = monthRides.reduce((sum, r) => sum + r.fareCents, 0);
      const tax = Math.round(amount * 0.07);
      const total = amount + tax;

      // created_at must land inside the month it bills (the revenue chart
      // buckets paid invoices by created_at). Past months: the 27th at
      // noon UTC. Current month: just before now, clamped so a run in the
      // first minutes of the 1st can't spill into the previous month.
      let createdAt;
      if (m === 0) {
        const candidate = plusMinutes(NOW, -45);
        createdAt = candidate > monthStart ? candidate : plusMinutes(monthStart, 30);
      } else {
        createdAt = atUtc(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 27, 12, 0);
      }
      const paidAt = plusMinutes(createdAt, 15);

      // Distinct rider per month (m = 0..5 → riders 0..5): satisfies the
      // invoices_rider_period_unique partial index by construction.
      const invoiceRiderIdx = m;

      const [{ id: invoiceId }] = await db`
        INSERT INTO invoices (
          invoice_number, rider_id, ride_id, amount_cents, tax_cents, total_cents,
          status, billing_period, period_start, period_end, due_date, paid_at, created_at
        ) VALUES (
          ${`DEMO-INV-${monthKey}`}, ${riderId(invoiceRiderIdx)}, ${null},
          ${amount}, ${tax}, ${total}, 'paid', 'monthly',
          ${isoDate(monthStart)}, ${isoDate(monthEnd)},
          ${isoDate(plusDays(createdAt, 14))}, ${paidAt.toISOString()}, ${createdAt.toISOString()}
        )
        RETURNING id
      `;
      invoiceCount++;

      for (const r of monthRides) {
        lineItemRows.push({
          invoice_id: invoiceId,
          ride_id: r.dbId,
          description: `Ride on ${isoDate(r.scheduledPickupTime)}: ${r.pickupAddress} → ${r.dropoffAddress}`,
          amount_cents: r.fareCents,
          created_at: createdAt.toISOString(),
        });
      }

      paymentRows.push({
        invoice_id: invoiceId,
        rider_id: riderId(invoiceRiderIdx),
        amount_cents: total,
        stripe_payment_intent_id: `pi_demo_month_${monthKey}`,
        stripe_customer_id: `cus_demo_rider_${String(invoiceRiderIdx + 1).padStart(2, "0")}`,
        status: "succeeded",
        payment_method_type: "card",
        failure_reason: null,
        created_at: paidAt.toISOString(),
      });
    }

    // Current-period per-ride pending + overdue invoices.
    const billingRides = {
      pending: allRideDescriptors.find((r) => r.tag === "billing-pending"),
      overdue: allRideDescriptors.find((r) => r.tag === "billing-overdue"),
    };

    const perRideDefs = [
      {
        key: "pending",
        number: "DEMO-INV-PEND-01",
        status: "pending",
        ride: billingRides.pending,
        createdAt: plusHours(billingRides.pending.completedAt, 1),
      },
      {
        key: "overdue",
        number: "DEMO-INV-OVER-01",
        status: "overdue",
        ride: billingRides.overdue,
        createdAt: plusHours(billingRides.overdue.completedAt, 1),
      },
    ];

    const perRideInvoiceIds = {};
    for (const def of perRideDefs) {
      const amount = def.ride.fareCents;
      const tax = Math.round(amount * 0.07);
      const total = amount + tax;

      const [{ id }] = await db`
        INSERT INTO invoices (
          invoice_number, rider_id, ride_id, amount_cents, tax_cents, total_cents,
          status, billing_period, due_date, paid_at, created_at
        ) VALUES (
          ${def.number}, ${riderId(def.ride.riderIdx)}, ${def.ride.dbId},
          ${amount}, ${tax}, ${total}, ${def.status}, 'per_ride',
          ${isoDate(plusDays(def.createdAt, 14))}, ${null}, ${def.createdAt.toISOString()}
        )
        RETURNING id
      `;
      perRideInvoiceIds[def.key] = id;
      invoiceCount++;

      lineItemRows.push({
        invoice_id: id,
        ride_id: def.ride.dbId,
        description: `Ride on ${isoDate(def.ride.scheduledPickupTime)}: ${def.ride.pickupAddress} → ${def.ride.dropoffAddress}`,
        amount_cents: def.ride.fareCents,
        created_at: def.createdAt.toISOString(),
      });
    }
    counts.invoices = invoiceCount;

    const pendingDef = perRideDefs.find((d) => d.key === "pending");
    const overdueDef = perRideDefs.find((d) => d.key === "overdue");
    paymentRows.push(
      {
        invoice_id: perRideInvoiceIds.pending,
        rider_id: riderId(pendingDef.ride.riderIdx),
        amount_cents: pendingDef.ride.fareCents + Math.round(pendingDef.ride.fareCents * 0.07),
        stripe_payment_intent_id: "pi_demo_pending_0002",
        stripe_customer_id: "cus_demo_rider_02",
        status: "pending",
        payment_method_type: "card",
        failure_reason: null,
        created_at: plusHours(pendingDef.createdAt, 1).toISOString(),
      },
      {
        invoice_id: perRideInvoiceIds.overdue,
        rider_id: riderId(overdueDef.ride.riderIdx),
        amount_cents: overdueDef.ride.fareCents + Math.round(overdueDef.ride.fareCents * 0.07),
        stripe_payment_intent_id: "pi_demo_overdue_0003",
        stripe_customer_id: "cus_demo_rider_03",
        status: "failed",
        payment_method_type: "card",
        failure_reason: "card_declined",
        created_at: plusDays(overdueDef.createdAt, 20).toISOString(),
      }
    );

    // --- invoice_line_items ------------------------------------------------
    await db`
      INSERT INTO invoice_line_items ${db(
        lineItemRows,
        "invoice_id",
        "ride_id",
        "description",
        "amount_cents",
        "created_at"
      )}
    `;
    counts.invoice_line_items = lineItemRows.length;

    // --- payments ----------------------------------------------------------
    await db`
      INSERT INTO payments ${db(
        paymentRows,
        "invoice_id",
        "rider_id",
        "amount_cents",
        "stripe_payment_intent_id",
        "stripe_customer_id",
        "status",
        "payment_method_type",
        "failure_reason",
        "created_at"
      )}
    `;
    counts.payments = paymentRows.length;

    // --- rider_payment_accounts (autopay rider + the 2 billing riders) ----
    const paymentAccountRows = [
      {
        rider_id: riderId(0),
        stripe_customer_id: "cus_demo_rider_01",
        default_payment_method_id: "pm_demo_rider_01",
        autopay_enabled: true,
      },
      {
        rider_id: riderId(pendingDef.ride.riderIdx),
        stripe_customer_id: "cus_demo_rider_02",
        default_payment_method_id: "pm_demo_rider_02",
        autopay_enabled: false,
      },
      {
        rider_id: riderId(overdueDef.ride.riderIdx),
        stripe_customer_id: "cus_demo_rider_03",
        default_payment_method_id: "pm_demo_rider_03",
        autopay_enabled: false,
      },
    ];
    await db`
      INSERT INTO rider_payment_accounts ${db(
        paymentAccountRows,
        "rider_id",
        "stripe_customer_id",
        "default_payment_method_id",
        "autopay_enabled"
      )}
      ON CONFLICT (rider_id) DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        default_payment_method_id = EXCLUDED.default_payment_method_id,
        autopay_enabled = EXCLUDED.autopay_enabled,
        updated_at = now()
    `;
    counts.rider_payment_accounts = paymentAccountRows.length;
  });

  console.log("Demo seed complete:");
  for (const [table, n] of Object.entries(counts)) {
    console.log(`  ${table}: ${n}`);
  }
}

main()
  .catch((err) => {
    console.error("Demo seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
