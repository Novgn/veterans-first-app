# veterans-first-app - Epic Breakdown

**Author:** Wayne
**Date:** 2025-12-06
**Project Level:** MVP
**Target Scale:** 50-100 concurrent users → 1000+ users at scale

---

## Overview

This document provides the complete epic and story breakdown for veterans-first-app, decomposing the requirements from the [PRD](./prd.md) into implementable stories with full technical context from [Architecture](./architecture.md) and user experience patterns from [UX Design](./ux-design-specification.md).

**Living Document Notice:** This document represents the implementation-ready breakdown for MVP development.

---

## Context Validation

### Documents Loaded

| Document         | Status    | Key Content                                                            |
| ---------------- | --------- | ---------------------------------------------------------------------- |
| **PRD**          | ✅ Loaded | 87 FRs across 9 capability areas, North Star metrics, user journeys    |
| **Architecture** | ✅ Loaded | Monorepo with Turborepo, Expo + Next.js, Supabase + Clerk, Drizzle ORM |
| **UX Design**    | ✅ Loaded | "Warm & Minimal" direction, 3-tap booking, component strategy          |

### Technology Stack Summary

| Layer          | Technology                              | Purpose                            |
| -------------- | --------------------------------------- | ---------------------------------- |
| Mobile         | React Native Expo (SDK 54+), NativeWind | Cross-platform Rider + Driver apps |
| Web            | Next.js 15+, Tailwind CSS, shadcn/ui    | Admin Console, Business Ops        |
| Auth           | Clerk                                   | Phone-first authentication, RBAC   |
| Database       | Supabase (PostgreSQL + Realtime + RLS)  | Source of truth, real-time sync    |
| State          | TanStack Query + Zustand                | Server state + client state        |
| Payments       | Stripe                                  | Payment processing                 |
| Communications | Twilio (SMS), Expo Notifications (Push) | Multi-channel notifications        |
| Maps           | Google Maps Platform, Expo Maps         | Geocoding, navigation              |

### Architecture Decisions Impacting Stories

1. **Monorepo Structure** → Shared packages enable code reuse across apps
2. **Hybrid API Pattern** → Direct Supabase for reads, Edge Functions for business logic
3. **Feature-First Organization** → Stories map to `/features/{name}/` structure
4. **Clerk + Supabase JWT** → Phone authentication flows through Clerk
5. **Drizzle ORM** → Type-safe schema management for all data models

### UX Patterns Impacting Stories

1. **3-Tap Booking** → Where → When → Confirm (sacred, irreducible)
2. **Same-Driver Matching** → Relationship history visible on DriverCard
3. **Phone-First Accessibility** → PhoneButton always visible in header
4. **Price Lock Badge** → "No surge. Ever." trust indicator
5. **48dp+ Touch Targets** → All interactive elements must meet accessibility standards

---

## Functional Requirements Inventory

### FR Summary by Category

| Category                        | FR Count | MVP Priority |
| ------------------------------- | -------- | ------------ |
| Ride Booking & Management       | 12       | Core         |
| Family & Caregiver Support      | 6        | Core         |
| Driver Operations               | 12       | Core         |
| Dispatch & Admin Operations     | 16       | Core         |
| Trip Documentation & Compliance | 10       | Core         |
| Business Operations             | 11       | Core         |
| User Account Management         | 7        | Core         |
| Notifications & Communications  | 8        | Core         |
| System Administration           | 5        | Core         |
| **Total**                       | **87**   | **All MVP**  |

### Complete FR Inventory

#### Ride Booking & Management (FR1-FR12)

| FR   | Description                                                                                  | Epic Target |
| ---- | -------------------------------------------------------------------------------------------- | ----------- |
| FR1  | Riders can book a one-time ride by specifying pickup location, destination, and desired time | Epic 2      |
| FR2  | Riders can book recurring rides with specified frequency (daily, weekly, specific days)      | Epic 2      |
| FR3  | Riders can save frequently used destinations with custom labels                              | Epic 2      |
| FR4  | Riders can view the exact price of a ride before confirming booking                          | Epic 2      |
| FR5  | Riders can modify or cancel scheduled rides before the ride begins                           | Epic 2      |
| FR6  | Riders can request a specific driver by name for their booking                               | Epic 2      |
| FR7  | Riders can book rides via phone call with live human assistance                              | Epic 3      |
| FR8  | Riders can confirm upcoming rides via automated phone call                                   | Epic 3      |
| FR9  | Riders can view their upcoming scheduled rides with all details                              | Epic 2      |
| FR10 | Riders can see their assigned driver's name, photo, and vehicle information                  | Epic 2      |
| FR11 | Riders can track their driver's real-time location and estimated arrival time                | Epic 2      |
| FR12 | Riders can contact their assigned driver directly via phone call or text                     | Epic 2      |

#### Family & Caregiver Support (FR13-FR18)

| FR   | Description                                                                                  | Epic Target |
| ---- | -------------------------------------------------------------------------------------------- | ----------- |
| FR13 | Authorized family members can book rides on behalf of a rider                                | Epic 4      |
| FR14 | Authorized family members can view the rider's scheduled and completed rides                 | Epic 4      |
| FR15 | Authorized family members can receive real-time notifications when rider is picked up        | Epic 4      |
| FR16 | Authorized family members can receive notification and photo confirmation when rider arrives | Epic 4      |
| FR17 | Riders can designate which family members have access to their ride information              | Epic 4      |
| FR18 | Riders can revoke family member access at any time                                           | Epic 4      |

#### Driver Operations (FR19-FR30)

| FR   | Description                                                                                     | Epic Target |
| ---- | ----------------------------------------------------------------------------------------------- | ----------- |
| FR19 | Drivers can view their assigned trip queue with all upcoming rides                              | Epic 3      |
| FR20 | Drivers can see rider profile information including name, photo, preferences, and special needs | Epic 3      |
| FR21 | Drivers can accept or decline offered rides based on their availability                         | Epic 3      |
| FR22 | Drivers can mark trip status transitions (en route, arrived, started, completed)                | Epic 3      |
| FR23 | Drivers can contact riders directly via phone call or text                                      | Epic 3      |
| FR24 | Drivers can use integrated turn-by-turn navigation to pickup and destination                    | Epic 3      |
| FR25 | Drivers can set their availability schedule indicating when they can accept rides               | Epic 3      |
| FR26 | Drivers can block time off on their calendar                                                    | Epic 3      |
| FR27 | Drivers can view their daily/weekly schedule of assigned rides                                  | Epic 3      |
| FR28 | Drivers can view their earnings summary (daily, weekly, monthly)                                | Epic 3      |
| FR29 | Drivers can see breakdown of earnings per completed ride                                        | Epic 3      |
| FR30 | Drivers can view their performance metrics and rider feedback                                   | Epic 3      |

#### Dispatch & Admin Operations (FR31-FR46)

| FR   | Description                                                                         | Epic Target |
| ---- | ----------------------------------------------------------------------------------- | ----------- |
| FR31 | Dispatchers can view real-time map showing all active drivers and their status      | Epic 3      |
| FR32 | Dispatchers can see driver status (available, on trip, offline) at a glance         | Epic 3      |
| FR33 | Dispatchers can view all scheduled, active, and completed rides for the current day | Epic 3      |
| FR34 | Dispatchers can manually assign drivers to rides                                    | Epic 3      |
| FR35 | Dispatchers can reassign a ride from one driver to another                          | Epic 3      |
| FR36 | Dispatchers can create new ride bookings on behalf of riders                        | Epic 3      |
| FR37 | Dispatchers can modify or cancel existing ride bookings                             | Epic 3      |
| FR38 | Dispatchers can view and search rider database by name or phone number              | Epic 3      |
| FR39 | Dispatchers can view rider profile including contact info, addresses, preferences   | Epic 3      |
| FR40 | Dispatchers can add notes to rider profiles                                         | Epic 3      |
| FR41 | Dispatchers can create new rider accounts                                           | Epic 3      |
| FR42 | Admins can view and manage driver roster                                            | Epic 5      |
| FR43 | Admins can onboard new drivers including profile setup and credential verification  | Epic 5      |
| FR44 | Admins can deactivate drivers who no longer meet requirements                       | Epic 5      |
| FR45 | Dispatchers can log incoming phone calls and link them to rider records             | Epic 3      |
| FR46 | Dispatchers can create ride bookings during phone calls with caller ID lookup       | Epic 3      |

#### Trip Documentation & Compliance (FR47-FR56)

| FR   | Description                                                                    | Epic Target |
| ---- | ------------------------------------------------------------------------------ | ----------- |
| FR47 | System automatically records pickup time, location, and driver for each trip   | Epic 3      |
| FR48 | System automatically records dropoff time and location for each completed trip | Epic 3      |
| FR49 | Drivers can capture photo documentation of safe arrival                        | Epic 3      |
| FR50 | System calculates and stores mileage for each completed trip                   | Epic 3      |
| FR51 | Drivers can mark a ride as no-show when rider is not present                   | Epic 3      |
| FR52 | Dispatchers can review and process no-show incidents                           | Epic 3      |
| FR53 | System tracks no-show history per rider                                        | Epic 3      |
| FR54 | System logs all access to rider personal and medical information               | Epic 1      |
| FR55 | System maintains audit trail of all ride modifications and status changes      | Epic 1      |
| FR56 | Admins can generate compliance reports showing trip documentation completeness | Epic 5      |

#### Business Operations (FR57-FR67)

| FR   | Description                                                                        | Epic Target |
| ---- | ---------------------------------------------------------------------------------- | ----------- |
| FR57 | System generates invoices for completed rides                                      | Epic 5      |
| FR58 | Riders can pay for rides via credit card                                           | Epic 5      |
| FR59 | System supports recurring billing for riders with regular rides                    | Epic 5      |
| FR60 | Admins can view and manage rider payment accounts                                  | Epic 5      |
| FR61 | System tracks driver earnings for payroll purposes                                 | Epic 5      |
| FR62 | Admins can view operational reports (rides per day, on-time rate, no-show rate)    | Epic 5      |
| FR63 | Admins can view financial reports (revenue, driver payments, outstanding invoices) | Epic 5      |
| FR64 | Admins can export ride data for compliance documentation                           | Epic 5      |
| FR65 | System stores driver credentials (license, insurance, background checks)           | Epic 5      |
| FR66 | System alerts admins when driver credentials are approaching expiration            | Epic 5      |
| FR67 | Admins can verify and update driver credential status                              | Epic 5      |

#### User Account Management (FR68-FR74)

| FR   | Description                                                                     | Epic Target |
| ---- | ------------------------------------------------------------------------------- | ----------- |
| FR68 | Users can register using their phone number as primary identifier               | Epic 1      |
| FR69 | Users can authenticate via SMS verification code                                | Epic 1      |
| FR70 | System enforces role-based access (rider, driver, family, dispatcher, admin)    | Epic 1      |
| FR71 | Riders can update their profile information (name, phone, emergency contact)    | Epic 2      |
| FR72 | Riders can set accessibility preferences (wheelchair, walker, mobility aids)    | Epic 2      |
| FR73 | Riders can specify comfort preferences (temperature, conversation level, music) | Epic 2      |
| FR74 | Drivers can update their profile information and vehicle details                | Epic 3      |

#### Notifications & Communications (FR75-FR82)

| FR   | Description                                                                | Epic Target |
| ---- | -------------------------------------------------------------------------- | ----------- |
| FR75 | System sends ride reminder notifications 24 hours and 1 hour before rides  | Epic 4      |
| FR76 | System sends notification when driver is en route to pickup                | Epic 4      |
| FR77 | System sends notification when driver arrives at pickup location           | Epic 4      |
| FR78 | Riders can configure their notification preferences (push, SMS, or both)   | Epic 4      |
| FR79 | Drivers receive notification when new ride is assigned                     | Epic 4      |
| FR80 | Drivers receive notification if assigned ride is cancelled or modified     | Epic 4      |
| FR81 | Designated family members receive pickup notification automatically        | Epic 4      |
| FR82 | Designated family members receive arrival notification with optional photo | Epic 4      |

#### System Administration (FR83-FR87)

| FR   | Description                                                                  | Epic Target |
| ---- | ---------------------------------------------------------------------------- | ----------- |
| FR83 | Admins can configure service area boundaries                                 | Epic 5      |
| FR84 | Admins can configure pricing parameters (base rate, mileage rate, wait time) | Epic 5      |
| FR85 | Admins can configure operating hours                                         | Epic 5      |
| FR86 | Admins can manage dispatcher and admin user accounts                         | Epic 5      |
| FR87 | Admins can reset user passwords and unlock accounts                          | Epic 5      |

---

## Epic Structure Plan

### Epic Overview

| Epic | Title                                | User Value                                                              | FR Count | Dependencies |
| ---- | ------------------------------------ | ----------------------------------------------------------------------- | -------- | ------------ |
| 1    | Foundation & Infrastructure          | Developers can begin building features on a solid, compliant foundation | 5        | None         |
| 2    | Rider Booking Experience             | Riders can book rides in 3 taps and manage their transportation         | 14       | Epic 1       |
| 3    | Driver & Dispatch Operations         | Drivers can manage trips; dispatchers can coordinate the fleet          | 32       | Epic 1, 2    |
| 4    | Family Support & Notifications       | Families get peace of mind; everyone receives timely updates            | 14       | Epic 2, 3    |
| 5    | Business Operations & Administration | Business runs profitably with compliance and financial oversight        | 22       | Epic 1, 3    |

### Epic 1: Foundation & Infrastructure

**User Value Statement:** The development team can build all subsequent features on a properly configured, secure, and compliant technical foundation. This epic delivers no direct user-facing functionality but enables everything that follows.

**PRD Coverage:** FR54, FR55, FR68, FR69, FR70

**Technical Context (Architecture — REVISED 2026-04-15):**

- Scaffold via `npx create-rell-app@latest veterans-first --template monolith` (apps/mobile, apps/web, packages/shared, packages/config)
- Supabase project setup with PostgreSQL + Realtime
- Drizzle ORM schema foundation (users, audit_logs tables) in `packages/shared/db/`
- Clerk authentication with Supabase JWT template + role claims (rider, driver, family, dispatcher, admin)
- Role-gated route groups: `apps/mobile/app/(rider|driver|family)/_layout.tsx` + `apps/web/app/{dispatch,admin,business}/layout.tsx` using rell `RoleGate`
- Row Level Security (RLS) policies for role-based data access
- Shared package: `@veterans-first/shared` exports db client, schema, queries, validation

**UX Integration:** Role Switcher component for multi-role users (see UX Spec)

**Foundation Epic Guidelines:**

- Monolith scaffold and migration of in-flight work
- Core infrastructure and deployment pipeline
- Database schema setup with audit logging (in `packages/shared/db/`)
- Authentication foundation (Clerk + Supabase JWT + role claims + RoleGate)
- API framework setup (Edge Functions structure)

---

### Epic 2: Rider Booking Experience

**User Value Statement:** Margaret can book her Tuesday grocery run in 3 taps, save her favorite destinations, see the exact price before confirming, and track Dave's arrival in real-time — all without needing to call her daughter for help.

**PRD Coverage:** FR1, FR2, FR3, FR4, FR5, FR6, FR9, FR10, FR11, FR12, FR71, FR72, FR73

**Technical Context (Architecture — REVISED 2026-04-15):**

- `apps/mobile/app/(rider)/` Expo route group, gated by Clerk `role=rider`
- `apps/mobile/features/rider/booking/` with BookingWizard component
- `apps/mobile/features/rider/profile/` for rider preferences
- `apps/mobile/features/rider/rides/` for ride list and tracking
- Supabase tables: `rides`, `saved_destinations`, `rider_preferences` (defined in `packages/shared/db/schema.ts`)
- Edge Functions: `book-ride`, `cancel-ride`, `calculate-price`
- TanStack Query for ride data caching + real-time subscriptions
- Zustand for booking wizard state

**UX Integration (UX Design):**

- 3-Tap Booking: Where → When → Confirm (sacred flow)
- DestinationPicker with large touch targets (48dp+)
- TimePicker with senior-friendly date/time selection
- PriceLockBadge showing "$X locked. No surge. Ever."
- RideCard with StatusTimeline (Booked → Confirmed → Assigned → En Route → Arrived)
- DriverCard with photo, name, vehicle, relationship history
- PhoneButton always visible in header
- Bottom tab navigation: Home, My Rides, Profile, Help

---

### Epic 3: Driver & Dispatch Operations

**User Value Statement:** Dave can see his assigned rides with full rider context (preferences, accessibility needs), navigate efficiently, mark trip status, and track his earnings. Diana can see the entire fleet in real-time, assign drivers to rides, and manage riders through the Admin Console.

**PRD Coverage:** FR7, FR8, FR19-FR53, FR74

**Technical Context (Architecture — REVISED 2026-04-15):**

- `apps/mobile/app/(driver)/` Expo route group, gated by Clerk `role=driver`
- `apps/web/app/dispatch/` Next.js section, gated by Clerk `role=dispatcher|admin`
- `apps/mobile/features/driver/trips/` for driver queue and trip management
- `apps/web/app/dispatch/` for fleet map and ride assignment
- `apps/web/app/dispatch/riders/` for rider database management
- Supabase tables: `driver_profiles`, `driver_locations`, `ride_events`, `no_shows` (in `packages/shared/db/schema.ts`)
- Supabase Realtime channels: `fleet:active`, `driver:{id}:location`, `ride:{id}`
- Edge Functions: `assign-driver`, `complete-ride`, `process-no-show`
- Google Maps / Expo Maps integration for navigation
- Photo upload to Supabase Storage for arrival confirmation

**UX Integration (UX Design):**

- Driver App: Trip queue cards with RiderProfileCard
- Wait time indicator: "20 min included" as feature
- Trip completion flow: Arrived → Started → Completed + Photo
- Admin Console: FleetMap with real-time driver positions
- DispatchBoard for ride assignment (drag-drop reassignment)
- RiderDatabase with search and profile management
- BookingManager for phone-created rides

---

### Epic 4: Family Support & Notifications

**User Value Statement:** Sarah receives automatic notifications when Mom is picked up and gets a photo confirmation when she arrives safely — providing peace of mind without invading Margaret's privacy. All users receive timely ride reminders and status updates.

**PRD Coverage:** FR13, FR14, FR15, FR16, FR17, FR18, FR75, FR76, FR77, FR78, FR79, FR80, FR81, FR82

**Technical Context (Architecture — REVISED 2026-04-15):**

- `apps/mobile/app/(family)/` Expo route group, gated by Clerk `role=family` (or rider with linked family role)
- `apps/mobile/features/family/` for linking + linked-rider view
- `apps/mobile/features/rider/family/` for rider-side consent management
- `apps/mobile/features/notifications/` + `apps/web/features/notifications/` for prefs UI
- Supabase tables: `family_links`, `notification_preferences`, `notification_logs` (in `packages/shared/db/schema.ts`)
- Edge Functions: `send-notification`, `link-family-member`
- Expo Notifications for push (via Expo Push API)
- Twilio for SMS notifications
- Supabase Storage for arrival photos
- Clerk for family member invitation flows

**UX Integration (UX Design):**

- Family permission model: Rider approves → Family sees rides
- FamilyNotificationCard with photo proof + ride status
- Notification preferences: Push, SMS, or both
- Automatic notifications: No per-ride configuration needed
- Photo proof as emotional payoff for families

---

### Epic 5: Business Operations & Administration

**User Value Statement:** The business operates profitably with accurate invoicing, driver payroll tracking, credential management, and compliance reporting. Admins can configure pricing, service areas, and manage the entire operation.

**PRD Coverage:** FR42, FR43, FR44, FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR83, FR84, FR85, FR86, FR87

**Technical Context (Architecture — REVISED 2026-04-15):**

- `apps/web/app/business/` Next.js section, gated by Clerk `role=admin`
- `apps/web/app/admin/` Next.js section for driver roster + credentials + settings
- `apps/web/app/business/billing/` for invoicing and payments
- `apps/web/app/admin/compliance/` for reporting and audits
- `apps/web/app/admin/credentials/` for driver credential management
- `apps/web/app/admin/settings/` for system configuration
- Supabase tables: `invoices`, `payments`, `driver_credentials`, `system_config` (in `packages/shared/db/schema.ts`)
- Stripe integration for payment processing
- Edge Functions: `process-payment`, `generate-invoice`, `webhook-stripe`
- Scheduled functions for credential expiration alerts

**UX Integration (UX Design):**

- Business Ops dashboard with financial overview
- Invoice generation and management
- Driver credential tracking with expiration alerts
- Compliance reporting with export functionality
- System settings for pricing, service area, hours

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the technical foundation that enables all subsequent feature development with proper security, compliance, and developer experience.

**FR Coverage:** FR54, FR55, FR68, FR69, FR70

---

### Story 1.1: Scaffold create-rell-app Monolith

As a developer,
I want the repo scaffolded from the create-rell-app monolith template,
So that we have a single role-aware mobile app, a single role-aware web app, and a shared db/validation package — aligned with our canonical starter.

**Acceptance Criteria:**

**Given** a new project directory (or in-place migration of current tree)
**When** `npx create-rell-app@latest veterans-first --template monolith` is run
**Then** the following structure exists:

- `apps/mobile/` — Expo + Expo Router + NativeWind + Clerk + Supabase (role-gated route groups)
- `apps/web/` — Next.js + Tailwind + shadcn/ui + Clerk + Supabase
- `packages/shared/` — Drizzle schema, queries, validation, drizzle.config
- `packages/config/` — ESLint, TypeScript, Prettier
- `supabase/` — Edge Functions only (migrations live in `packages/shared/db/migrations/`)
- Husky pre-commit hook installed

**And** Turborepo is configured with build, dev, lint, test pipelines.

**And** both apps run independently with `npm run dev`.

**And** shared package is importable as `@veterans-first/shared` from both apps.

**Technical Notes:**

- Use npm (matches rell default)
- Configure `.nvmrc` with Node 20 LTS
- Populate `.env.example` with Clerk, Supabase, Stripe, Twilio, Google Maps keys

**Prerequisites:** None (first story)

---

### Story 1.2: Migrate Completed Rider & Driver Code

As a developer,
I want Stories 2.13–2.14 (rider accessibility/comfort prefs) and StatusToggle (driver) relocated into the new structure,
So that no completed work is lost and tests still pass in the new tree.

**Acceptance Criteria:**

**Given** the rell monolith is scaffolded
**When** migration runs
**Then**:

- `apps/rider/src/features/*` → `apps/mobile/features/rider/*` (via `git mv`)
- `apps/driver/src/features/*` → `apps/mobile/features/driver/*` (via `git mv`)
- `apps/admin/*` → `apps/web/app/dispatch/` + `apps/web/app/admin/`
- `apps/business/*` → `apps/web/app/business/`
- `supabase/migrations/*` → `packages/shared/db/migrations/*`
- `drizzle.config.ts` → `packages/shared/drizzle.config.ts`
- Imports rewired to `@veterans-first/shared`
- All existing tests green (StatusToggle tests, rider preference tests)
- CI workflows (`.github/workflows/*`) path-updated

**Prerequisites:** Story 1.1

---

### Story 1.3: Configure Clerk Role Claims and Route-Group Guards

As a developer,
I want Clerk issuing role claims (rider, driver, family, dispatcher, admin) and route-group layouts enforcing them,
So that signing in routes a user to the correct surface and unauthorized access is blocked.

**Acceptance Criteria:**

- Clerk custom JWT template includes `role` claim (read from user metadata)
- Supabase JWT template consumes Clerk role for RLS
- `apps/mobile/app/(rider)/_layout.tsx`, `(driver)/_layout.tsx`, `(family)/_layout.tsx` use rell `RoleGate` to enforce role
- `apps/web/app/dispatch/layout.tsx`, `admin/layout.tsx`, `business/layout.tsx` use `RoleGate`
- Multi-role users see a Role Switcher component (per UX spec); single-role users auto-route post sign-in
- Unauthorized route access redirects to a "not permitted" page

**Prerequisites:** Story 1.1, Story 1.2

---

### Story 1.2: Configure Supabase Project and Database Schema Foundation

As a developer,
I want Supabase configured with the foundational database schema,
So that all apps can interact with a properly structured database.

**Acceptance Criteria:**

**Given** the monorepo is initialized
**When** Supabase is configured
**Then** the following exists:

- Supabase project created (or local development setup with `supabase init`)
- `supabase/config.toml` configured for project
- Connection to Supabase from all apps works

**And** the following core tables are created via Drizzle migrations:

```sql
-- users table (extended by Clerk)
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'family', 'dispatcher', 'admin')),
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- audit_logs table (FR54, FR55)
audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**And** Drizzle ORM is configured:

- `packages/shared/src/db/schema.ts` with table definitions
- `drizzle.config.ts` at monorepo root
- Migration generation works with `npm run db:generate`
- Migration push works with `npm run db:push`

**And** TypeScript types are generated from schema

**Technical Notes:**

- Use Drizzle ORM as specified in Architecture
- Audit logs must be append-only (no UPDATE or DELETE policies)
- All timestamps use `timestamptz` for timezone awareness
- Follow naming conventions: snake_case for tables/columns

**Prerequisites:** Story 1.1

---

### Story 1.3: Implement Clerk Authentication Integration

As a user,
I want to register and authenticate using my phone number,
So that I can access the system without complex passwords or email verification.

**Acceptance Criteria:**

**Given** a user opens any app (rider, driver, admin, business)
**When** they are not authenticated
**Then** they see a sign-in screen with phone number input

**Given** a user enters a valid phone number
**When** they submit the form
**Then** Clerk sends an SMS verification code
**And** user sees a code input screen

**Given** a user enters the correct verification code
**When** they submit
**Then** they are authenticated
**And** a JWT is issued that works with Supabase
**And** if new user: a record is created in `users` table
**And** they are redirected to the appropriate home screen

**Given** an authenticated user
**When** they make API requests
**Then** their JWT is included in Authorization header
**And** Supabase RLS policies can identify them via `auth.uid()`

**Technical Implementation:**

For Mobile Apps (Expo):

- Install `@clerk/clerk-expo`
- Configure ClerkProvider in `app/_layout.tsx`
- Create `(auth)/sign-in.tsx` and `(auth)/sign-up.tsx` screens
- Use `useAuth()` hook for auth state
- Configure Expo SecureStore for token persistence

For Web Apps (Next.js):

- Install `@clerk/nextjs`
- Configure ClerkProvider in `app/layout.tsx`
- Add `middleware.ts` for route protection
- Use `auth()` in server components

Clerk → Supabase JWT Integration:

- Configure Clerk JWT template to include Supabase claims
- Set up Supabase to verify Clerk JWTs
- Create `packages/shared/src/lib/supabase.ts` with auth client

**Technical Notes:**

- Phone authentication is PRIMARY method (per PRD)
- Email + password available for admin/dispatch (per Architecture)
- Configure Clerk webhooks to sync user creation to Supabase
- Follow Architecture "Authentication & Security" section

**Prerequisites:** Story 1.1, Story 1.2

---

### Story 1.4: Implement Role-Based Access Control (RBAC)

As a system administrator,
I want role-based access control enforced at the database level,
So that users can only access data appropriate to their role.

**Acceptance Criteria:**

**Given** a user with role "rider"
**When** they query the `rides` table
**Then** they only see rides where they are the rider

**Given** a user with role "driver"
**When** they query the `rides` table
**Then** they only see rides assigned to them with status 'assigned' or 'in_progress'

**Given** a user with role "family"
**When** they query the `rides` table
**Then** they only see rides for riders they are linked to

**Given** a user with role "dispatcher"
**When** they query the `rides` table
**Then** they see all rides

**Given** a user with role "admin"
**When** they access any table
**Then** they have full access

**And** the following RLS policies are implemented:

```sql
-- Riders see own rides
CREATE POLICY "riders_own_rides" ON rides
  FOR SELECT TO authenticated
  USING (rider_id = auth.uid() AND (SELECT role FROM users WHERE id = auth.uid()) = 'rider');

-- Drivers see assigned rides
CREATE POLICY "drivers_assigned_rides" ON rides
  FOR SELECT TO authenticated
  USING (driver_id = auth.uid() AND status IN ('assigned', 'in_progress')
         AND (SELECT role FROM users WHERE id = auth.uid()) = 'driver');

-- Family sees linked rider rides
CREATE POLICY "family_linked_rides" ON rides
  FOR SELECT TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'family'
    AND rider_id IN (
      SELECT rider_id FROM family_links
      WHERE family_member_id = auth.uid() AND status = 'approved'
    )
  );

-- Dispatchers see all
CREATE POLICY "dispatchers_all_rides" ON rides
  FOR ALL TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('dispatcher', 'admin'));
```

**And** role assignment happens during user creation via Clerk webhook

**Technical Notes:**

- RLS policies must be tested with each role
- Create test users for each role in seed data
- Follow Architecture "Row Level Security Patterns"
- Roles are stored in `users.role` column

**Prerequisites:** Story 1.2, Story 1.3

---

### Story 1.5: Implement Audit Logging Infrastructure

As a compliance officer,
I want all access to sensitive data logged immutably,
So that we can demonstrate HIPAA compliance and investigate incidents.

**Acceptance Criteria:**

**Given** any user accesses rider personal information
**When** the query executes
**Then** an audit log entry is created with:

- User ID who accessed
- Action type (SELECT, INSERT, UPDATE, DELETE)
- Resource type (e.g., 'rider_profile', 'ride')
- Resource ID
- Timestamp
- IP address (when available)

**Given** any ride record is modified
**When** the update occurs
**Then** an audit log captures:

- Old values (before)
- New values (after)
- User who made the change

**Given** the audit_logs table
**When** any user attempts to UPDATE or DELETE
**Then** the operation is denied (append-only)

**And** audit logs can be queried by admins for compliance reporting

**Technical Implementation:**

Database triggers for automatic logging:

```sql
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_rides AFTER INSERT OR UPDATE OR DELETE ON rides
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
```

**And** RLS policy for audit_logs:

```sql
-- Only admins can read audit logs
CREATE POLICY "admins_read_audit" ON audit_logs
  FOR SELECT TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- No one can update or delete
CREATE POLICY "no_modify_audit" ON audit_logs
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "no_delete_audit" ON audit_logs
  FOR DELETE TO authenticated
  USING (false);
```

**Technical Notes:**

- SECURITY DEFINER ensures trigger runs with elevated privileges
- Consider table partitioning for audit_logs if volume is high
- Implement log rotation strategy for long-term storage
- This satisfies FR54 and FR55

**Prerequisites:** Story 1.2, Story 1.4

---

### Story 1.6: Configure Development Environment and CI/CD Foundation

As a developer,
I want consistent development tooling and automated quality checks,
So that the team can collaborate effectively with high code quality.

**Acceptance Criteria:**

**Given** a developer clones the repository
**When** they run `npm install`
**Then** all dependencies are installed across the monorepo

**And** the following scripts work:

- `npm run dev` - Starts all apps in development mode
- `npm run build` - Builds all apps
- `npm run lint` - Lints all apps and packages
- `npm run test` - Runs all tests
- `npm run db:generate` - Generates Drizzle migrations
- `npm run db:push` - Applies migrations to database

**And** ESLint is configured with:

- TypeScript support
- React/React Native rules
- Import sorting
- Accessibility rules (eslint-plugin-jsx-a11y)

**And** Prettier is configured for consistent formatting

**And** Husky pre-commit hooks run:

- Lint-staged for changed files
- Type checking

**And** GitHub Actions CI pipeline:

- Triggers on PR to main
- Runs lint, type check, and tests
- Fails if any check fails

**Technical Notes:**

- Use `packages/config/` for shared ESLint and TypeScript configs
- Configure Turborepo caching for faster builds
- Add `.github/workflows/ci.yml` for CI pipeline
- Follow Architecture "CI/CD Pipeline" section

**Prerequisites:** Story 1.1

---

**Epic 1 Complete**

**Stories Created:** 6
**FR Coverage:** FR54, FR55, FR68, FR69, FR70
**Technical Foundation:** Monorepo, Supabase, Clerk, Drizzle, RLS, Audit Logging, CI/CD

---

## Epic 2: Rider Booking Experience

**Goal:** Enable riders to book rides in 3 taps, manage their destinations, view upcoming rides, and track their driver in real-time.

**FR Coverage:** FR1, FR2, FR3, FR4, FR5, FR6, FR9, FR10, FR11, FR12, FR71, FR72, FR73

---

### Story 2.1: Create Rider App Shell and Navigation

As a rider,
I want a simple, accessible app with clear navigation,
So that I can easily find booking, rides, profile, and help sections.

**Acceptance Criteria:**

**Given** the rider app is launched
**When** user is authenticated
**Then** they see a home screen with:

- Bottom tab navigation: Home, My Rides, Profile, Help
- Header with app title and PhoneButton (always visible)
- Quick access to "Book a Ride" as primary action

**And** the navigation follows UX Design patterns:

- Bottom tabs with 48dp+ touch targets
- Icons with labels for clarity
- Active tab clearly indicated
- Phone icon in header always accessible

**And** the app structure follows Architecture:

```
apps/rider/
├── app/
│   ├── _layout.tsx (root layout with Clerk, Query providers)
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx (tab navigator)
│   │   ├── index.tsx (Home)
│   │   ├── rides.tsx (My Rides)
│   │   ├── profile.tsx (Profile)
│   │   └── help.tsx (Help)
│   └── rides/
│       └── [id].tsx (Ride details)
├── src/
│   ├── features/
│   │   ├── booking/
│   │   ├── rides/
│   │   └── profile/
│   └── components/
```

**And** NativeWind styling is configured with:

- Tailwind config matching UX Design tokens
- Primary blue (#1E40AF), warm white (#FAFAF9)
- 18px base font size
- 48dp minimum touch targets

**Technical Notes:**

- Follow UX Design "Warm & Minimal" direction
- Implement PhoneButton component from UX component strategy
- Configure TanStack Query provider with AsyncStorage persistence
- Configure Zustand stores for client state

**Prerequisites:** Epic 1 Complete

---

### Story 2.2: Implement Saved Destinations Management

As a rider,
I want to save my frequently used destinations with custom labels,
So that I can quickly select them when booking rides.

**Acceptance Criteria:**

**Given** a rider is on the Profile screen
**When** they navigate to "Saved Places"
**Then** they see a list of their saved destinations

**Given** a rider wants to add a new destination
**When** they tap "Add Place"
**Then** they can:

- Search for an address using Google Places Autocomplete
- Enter a custom label (e.g., "Home", "Dr. Wilson", "Harris Teeter")
- Mark as default pickup or dropoff
- Save the destination

**Given** a rider has saved destinations
**When** they start booking a ride
**Then** saved destinations appear as large, tappable cards in DestinationPicker

**And** the database schema includes:

```sql
saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  place_id TEXT, -- Google Places ID
  is_default_pickup BOOLEAN DEFAULT false,
  is_default_dropoff BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**And** RLS policies allow riders to manage only their own destinations

**Technical Notes:**

- Integrate Google Places API for address search
- Use Google Geocoding API to get lat/lng
- Store place_id for consistent address resolution
- Implement in `features/profile/` with dedicated screens
- This satisfies FR3

**Prerequisites:** Story 2.1

---

### Story 2.3: Implement 3-Tap Booking Flow - Destination Selection (Tap 1)

As a rider,
I want to select my destination with a single tap,
So that booking is effortless and I don't get confused.

**Acceptance Criteria:**

**Given** a rider taps "Book a Ride" on the home screen
**When** the BookingWizard opens
**Then** they see Step 1: "Where are you going?"

**And** the screen displays:

- DestinationPicker with saved destinations as large cards (56dp height)
- Most frequently used destinations shown first
- "Home" and default dropoff highlighted if set
- Search option for new addresses
- Current location option for pickup

**Given** a rider taps a saved destination
**When** the destination is selected
**Then** the wizard advances to Step 2 (When)
**And** a visual indicator shows progress (Step 1 of 3 complete)

**And** the DestinationPicker component:

- Uses 48dp+ touch targets
- Shows address preview below label
- Has clear visual hierarchy
- Supports both pickup and dropoff selection

**Technical Notes:**

- Create BookingWizard in `features/booking/components/`
- Use Zustand store for wizard state (`bookingStore`)
- DestinationPicker is a P0 custom component (UX Design)
- Progress indicator shows 3 steps clearly

**Prerequisites:** Story 2.2

---

### Story 2.4: Implement 3-Tap Booking Flow - Time Selection (Tap 2)

As a rider,
I want to select when I need my ride with a single tap,
So that scheduling is simple and predictable.

**Acceptance Criteria:**

**Given** a rider has selected their destination
**When** they reach Step 2
**Then** they see "When do you need a ride?"

**And** the TimePicker displays:

- Today's date selected by default
- Common time slots as large buttons (9:00 AM, 10:00 AM, etc.)
- "ASAP" option for immediate rides
- Custom date/time picker if needed
- Toggle for recurring ride setup

**Given** a rider taps a time slot
**When** the time is selected
**Then** the wizard advances to Step 3 (Confirm)

**Given** a rider enables "Make this recurring"
**When** they configure the schedule
**Then** they can select:

- Frequency: Daily, Weekly, Specific days
- End date or "Ongoing"

**And** the TimePicker component:

- Uses senior-friendly large buttons
- Shows AM/PM clearly
- Defaults to reasonable times (not 3 AM)
- Has generous touch targets

**Technical Notes:**

- Create TimePicker component matching UX Design
- Store time selection in bookingStore
- Recurring config stored separately for processing
- This contributes to FR1 and FR2

**Prerequisites:** Story 2.3

---

### Story 2.5: Implement 3-Tap Booking Flow - Confirmation (Tap 3)

As a rider,
I want to see a clear summary and confirm my booking with one tap,
So that I know exactly what I'm booking and feel confident.

**Acceptance Criteria:**

**Given** a rider has selected destination and time
**When** they reach Step 3
**Then** they see a confirmation screen with:

- Route summary (pickup → destination)
- Date and time of ride
- Price with PriceLockBadge ("$45 locked. No surge. Ever.")
- Wait time included ("20 min wait time included")
- Preferred driver (if any previously set)
- Large "Book This Ride" button

**Given** the price is calculated
**Then** the system uses the `calculate-price` Edge Function with:

- Base rate from system config
- Distance calculation via Google Distance Matrix API
- Time of day adjustments (if any)
- NO surge pricing ever

**Given** a rider taps "Book This Ride"
**When** the booking is submitted
**Then** the `book-ride` Edge Function:

- Creates ride record in database
- Sets status to 'booked'
- Creates recurring ride records if applicable
- Returns confirmation

**And** the rider sees:

- Success screen with celebration feedback
- Ride confirmation number
- 60-second undo button
- "Add to Calendar" option

**And** the rides table schema:

```sql
rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES users(id) NOT NULL,
  driver_id UUID REFERENCES users(id),
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat DECIMAL(10, 8) NOT NULL,
  dropoff_lng DECIMAL(11, 8) NOT NULL,
  scheduled_pickup_time TIMESTAMPTZ NOT NULL,
  actual_pickup_time TIMESTAMPTZ,
  actual_dropoff_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show')),
  price_cents INTEGER NOT NULL,
  distance_miles DECIMAL(6, 2),
  wait_time_minutes INTEGER DEFAULT 20,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern_id UUID,
  preferred_driver_id UUID REFERENCES users(id),
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Create PriceLockBadge component (UX Design P0)
- Implement `book-ride` Edge Function in `supabase/functions/`
- Use Google Distance Matrix for accurate pricing
- 60-second undo window via delayed status update
- This satisfies FR1, FR2, FR4

**Prerequisites:** Story 2.4

---

### Story 2.6: Implement Ride Modification and Cancellation

As a rider,
I want to modify or cancel my scheduled rides,
So that I can adjust plans without calling for help.

**Acceptance Criteria:**

**Given** a rider views an upcoming ride
**When** the ride is in 'booked' or 'confirmed' status
**Then** they can:

- Change the pickup time
- Change the destination
- Cancel the ride

**Given** a rider cancels a ride
**When** they confirm cancellation
**Then**:

- Ride status changes to 'cancelled'
- Cancellation reason is captured
- 60-second undo window appears
- Any assigned driver is notified

**Given** a rider cancels within 1 hour of scheduled time
**When** cancellation is processed
**Then** a late cancellation fee may apply (configurable)

**And** the `cancel-ride` Edge Function:

- Validates cancellation is allowed
- Updates ride status
- Notifies affected parties
- Applies fees if configured

**Technical Notes:**

- ConfirmationModal for destructive actions (UX Design)
- 60-second undo pattern from UX consistency patterns
- Audit log captures cancellation with reason
- This satisfies FR5

**Prerequisites:** Story 2.5

---

### Story 2.7: Implement Preferred Driver Selection

As a rider,
I want to request a specific driver for my rides,
So that I can ride with someone I trust and who knows my needs.

**Acceptance Criteria:**

**Given** a rider has completed rides with drivers
**When** they view their ride history or driver list
**Then** they see drivers they've ridden with before

**Given** a rider selects a preferred driver
**When** booking a new ride
**Then**:

- The booking includes `preferred_driver_id`
- Confirmation shows "Requesting [Driver Name]"
- System prioritizes matching to this driver

**Given** a rider wants to set a default preferred driver
**When** they update their preferences
**Then** future bookings default to this driver

**And** the system shows relationship history:

- "Dave has driven you 23 times"
- Driver photo, name, vehicle info
- Last ride date

**Technical Notes:**

- DriverCard component with relationship counter
- Store rider's driver history for display
- Same-driver matching is a SOFT preference (dispatch may override)
- This satisfies FR6 and supports PRD "relationship-first" model

**Prerequisites:** Story 2.5, Story 2.6

---

### Story 2.8: Implement My Rides Screen with Upcoming Rides

As a rider,
I want to see all my upcoming rides in one place,
So that I know my schedule and can manage my transportation.

**Acceptance Criteria:**

**Given** a rider navigates to "My Rides" tab
**When** the screen loads
**Then** they see:

- Upcoming rides sorted by date (nearest first)
- RideCard for each ride showing:
  - Date and time
  - Pickup and destination
  - Status (Booked, Confirmed, Assigned)
  - Driver info (if assigned)
  - StatusTimeline visualization

**Given** a rider taps on a ride
**When** the ride detail opens
**Then** they can:

- View full ride details
- See driver info and vehicle (if assigned)
- Access modify/cancel options
- Contact driver (if assigned)

**And** the RideCard component follows UX Design:

- 16px border radius, soft shadow
- Status indicated by color and badge
- Large touch target (full card tappable)
- Shows next action clearly

**And** TanStack Query fetches rides with:

- Real-time subscriptions for status updates
- Optimistic updates for modifications
- Cache persistence for offline viewing

**Technical Notes:**

- Create RideCard and StatusTimeline components (UX P0)
- Implement `rideKeys` query key factory (Architecture pattern)
- Subscribe to `ride:{id}` channel for real-time updates
- This satisfies FR9

**Prerequisites:** Story 2.5

---

### Story 2.9: Implement Driver Info Display

As a rider,
I want to see my assigned driver's information before pickup,
So that I know who to expect and feel safe.

**Acceptance Criteria:**

**Given** a ride has been assigned to a driver
**When** the rider views the ride
**Then** they see DriverCard with:

- Driver photo (profile_photo_url)
- Driver first name
- Vehicle description (make, model, color)
- Vehicle license plate
- Relationship history ("Driven you X times")

**Given** a ride status changes to 'assigned'
**When** the update occurs
**Then** rider receives notification
**And** DriverCard appears on ride detail

**And** the driver_profiles table:

```sql
driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  vehicle_color TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  bio TEXT,
  years_experience INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- DriverCard is P0 custom component (UX Design)
- Join rides with driver_profiles and users for full info
- Calculate relationship count from completed rides
- This satisfies FR10

**Prerequisites:** Story 2.8

---

### Story 2.10: Implement Real-Time Driver Tracking

As a rider,
I want to see my driver's location on a map with live ETA,
So that I know exactly when they'll arrive.

**Acceptance Criteria:**

**Given** a ride status is 'en_route' or 'arrived'
**When** the rider views the ride
**Then** they see:

- Map showing driver's current location
- Route from driver to pickup
- Live ETA updating every 30 seconds
- Driver vehicle icon moving on map

**Given** driver location updates
**When** new position is received
**Then** map smoothly animates to new position
**And** ETA recalculates

**And** real-time tracking uses:

- Supabase Realtime subscription to `driver:{id}:location` channel
- Google Directions API for route and ETA
- Expo Maps for map display

**And** the driver_locations table:

```sql
driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  accuracy DECIMAL(6, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Use Expo Maps (`expo-maps`) for map component
- Subscribe to real-time location channel
- Cache route to avoid excessive API calls
- Show "Driver Arrived" prominently when status changes
- This satisfies FR11

**Prerequisites:** Story 2.9

---

### Story 2.11: Implement Contact Driver Feature

As a rider,
I want to contact my assigned driver directly,
So that I can communicate about pickup details or delays.

**Acceptance Criteria:**

**Given** a ride has an assigned driver
**When** the rider views the ride detail
**Then** they see "Contact Driver" button

**Given** the rider taps "Contact Driver"
**When** the action sheet opens
**Then** they can choose:

- Call Driver (opens phone dialer)
- Text Driver (opens SMS)

**And** driver contact is available only when:

- Ride status is 'assigned', 'en_route', 'arrived', or 'in_progress'
- Driver is actively on the ride

**And** phone/SMS uses native device capabilities:

- `Linking.openURL('tel:${driverPhone}')`
- `Linking.openURL('sms:${driverPhone}')`

**Technical Notes:**

- PhoneButton variant for driver contact
- Contact info comes from driver's user record
- Log contact attempts in audit (optional)
- This satisfies FR12

**Prerequisites:** Story 2.10

---

### Story 2.12: Implement Rider Profile Management

As a rider,
I want to update my profile information and preferences,
So that drivers know my needs and I receive better service.

**Acceptance Criteria:**

**Given** a rider navigates to Profile tab
**When** the screen loads
**Then** they see:

- Profile photo
- Name (editable)
- Phone number (primary identifier, not editable in-app)
- Emergency contact (editable)

**Given** a rider edits their profile
**When** they save changes
**Then** the user record updates
**And** changes sync to all devices

**And** the profile includes:

- Basic info (name, photo, emergency contact)
- Saved destinations link
- Accessibility preferences link
- Comfort preferences link
- Family access management link
- Notification settings link

**Technical Notes:**

- Use Clerk user profile for basic info sync
- Store emergency_contact in users table extension
- Profile photo upload to Supabase Storage
- This satisfies FR71

**Prerequisites:** Story 2.1

---

### Story 2.13: Implement Accessibility Preferences

As a rider with mobility needs,
I want to specify my accessibility requirements,
So that drivers are prepared to assist me properly.

**Acceptance Criteria:**

**Given** a rider navigates to Accessibility Preferences
**When** the screen loads
**Then** they can configure:

- Mobility aids: Wheelchair, Walker, Cane, None
- Vehicle requirements: Extra space, Easy entry
- Assistance needed: Help to door, Help with packages
- Special equipment: Folding wheelchair, Power wheelchair

**Given** a rider saves accessibility preferences
**When** the preferences are stored
**Then**:

- Preferences appear on rider profile for drivers
- Booking confirmation shows accessibility notes
- Driver sees accessibility info on RiderProfileCard

**And** the rider_preferences table:

```sql
rider_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  mobility_aid TEXT CHECK (mobility_aid IN ('none', 'cane', 'walker', 'manual_wheelchair', 'power_wheelchair')),
  needs_door_assistance BOOLEAN DEFAULT false,
  needs_package_assistance BOOLEAN DEFAULT false,
  extra_vehicle_space BOOLEAN DEFAULT false,
  special_equipment_notes TEXT,
  comfort_temperature TEXT CHECK (comfort_temperature IN ('cool', 'normal', 'warm')),
  conversation_preference TEXT CHECK (conversation_preference IN ('quiet', 'some', 'chatty')),
  music_preference TEXT CHECK (music_preference IN ('none', 'soft', 'any')),
  other_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Use multi-select for some options
- Show clear descriptions for each preference
- This satisfies FR72

**Prerequisites:** Story 2.12

---

### Story 2.14: Implement Comfort Preferences

As a rider,
I want to specify my comfort preferences,
So that every ride feels personalized and comfortable.

**Acceptance Criteria:**

**Given** a rider navigates to Comfort Preferences
**When** the screen loads
**Then** they can configure:

- Temperature: Cool, Normal, Warm
- Conversation: Quiet ride, Some conversation, Chatty
- Music: No music, Soft background, Any music
- Other notes (free text)

**Given** preferences are saved
**When** a driver views the rider's profile
**Then** they see comfort preferences in RiderProfileCard

**And** comfort preferences support the PRD's "relationship-first" model:

- Dave knows Margaret likes it cool and quiet
- Preferences are visible before pickup

**Technical Notes:**

- Uses same rider_preferences table as Story 2.13
- Simple radio button groups for each preference
- This satisfies FR73

**Prerequisites:** Story 2.13

---

**Epic 2 Complete**

**Stories Created:** 14
**FR Coverage:** FR1, FR2, FR3, FR4, FR5, FR6, FR9, FR10, FR11, FR12, FR71, FR72, FR73
**Technical Components:** BookingWizard, DestinationPicker, TimePicker, PriceLockBadge, RideCard, DriverCard, StatusTimeline, Rider Profile

---

## Epic 3: Driver & Dispatch Operations

**Goal:** Enable drivers to manage their trips with full rider context, and empower dispatchers to coordinate the fleet through a real-time Admin Console.

**FR Coverage:** FR7, FR8, FR19-FR53, FR74

---

### Story 3.1: Create Driver App Shell and Navigation

As a driver,
I want a simple app focused on my assigned rides and earnings,
So that I can focus on serving riders without distractions.

**Acceptance Criteria:**

**Given** the driver app is launched
**When** user is authenticated with role 'driver'
**Then** they see a home screen with:

- Today's scheduled rides prominently displayed
- Current status indicator (Available, On Trip, Offline)
- Quick access to navigation for next ride
- Bottom tab navigation: Home, Schedule, Earnings, Profile

**And** the app structure follows Architecture:

```
apps/driver/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx (Home/Queue)
│   │   ├── schedule.tsx
│   │   ├── earnings.tsx
│   │   └── profile.tsx
│   └── trips/
│       └── [id].tsx (Active trip)
├── src/
│   ├── features/
│   │   ├── trips/
│   │   ├── schedule/
│   │   ├── earnings/
│   │   └── profile/
```

**And** driver-specific components include:

- Status toggle (Available/Offline)
- Trip queue cards with rider info
- Active trip view with navigation

**Technical Notes:**

- Follow same NativeWind config as rider app
- Share components from `@veterans-first/shared` where applicable
- Driver-specific Zustand store for trip state
- This enables all driver FR implementations

**Prerequisites:** Epic 1 Complete

---

### Story 3.2: Implement Driver Trip Queue

As a driver,
I want to see my assigned trips with all details,
So that I can prepare for each ride and serve riders well.

**Acceptance Criteria:**

**Given** a driver opens the app
**When** they view the home screen
**Then** they see their trip queue with:

- Upcoming rides sorted by scheduled time
- TripCard for each ride showing:
  - Pickup time
  - Rider name and photo
  - Pickup and dropoff addresses
  - Accessibility needs indicators
  - Special instructions preview

**Given** a driver taps on a TripCard
**When** the trip detail opens
**Then** they see full RiderProfileCard with:

- Rider photo and name
- Contact buttons (call/text)
- Accessibility preferences
- Comfort preferences
- Relationship history ("You've driven [Name] X times")
- Special instructions

**And** trips are fetched via TanStack Query with:

- Real-time subscription for new assignments
- Automatic refresh on app foreground
- Offline caching for reliability

**Technical Notes:**

- Create TripCard and RiderProfileCard components
- Query rides where `driver_id = current_user` and status in appropriate states
- Join with rider_preferences for full context
- This satisfies FR19, FR20

**Prerequisites:** Story 3.1

---

### Story 3.3: Implement Accept/Decline Rides

As a driver,
I want to accept or decline offered rides,
So that I have control over my schedule.

**Acceptance Criteria:**

**Given** a new ride is assigned to a driver
**When** the assignment notification arrives
**Then** driver sees:

- New ride offer with details
- Accept and Decline buttons
- Time limit for response (configurable, e.g., 5 minutes)

**Given** a driver taps Accept
**When** the action completes
**Then**:

- Ride status changes to 'assigned'
- Ride appears in driver's queue
- Rider is notified of driver assignment

**Given** a driver taps Decline
**When** the action completes
**Then**:

- Ride returns to dispatch pool
- Driver can optionally provide decline reason
- No penalty for reasonable declines

**And** the assign-driver Edge Function handles:

- Initial assignment from dispatch
- Driver acceptance/decline flow
- Fallback to next available driver on decline

**Technical Notes:**

- Push notification for new ride offers
- Store decline reasons for dispatch insights
- Configurable acceptance timeout
- This satisfies FR21

**Prerequisites:** Story 3.2

---

### Story 3.4: Implement Trip Status Transitions

As a driver,
I want to mark trip status as I progress through each ride,
So that riders and dispatchers know the ride status in real-time.

**Acceptance Criteria:**

**Given** a driver has an assigned trip
**When** they start working on the trip
**Then** they can mark status transitions:

1. **Start Route** → Status: 'en_route' (heading to pickup)
2. **Arrived** → Status: 'arrived' (at pickup location)
3. **Start Trip** → Status: 'in_progress' (rider in vehicle)
4. **Complete Trip** → Status: 'completed' (rider dropped off)

**Given** each status transition
**When** the driver confirms
**Then**:

- Ride status updates in database
- Rider receives push notification
- Timestamp is recorded
- Audit log entry created

**And** the ride_events table tracks all transitions:

```sql
ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) NOT NULL,
  event_type TEXT NOT NULL,
  driver_id UUID REFERENCES users(id),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**And** the active trip screen shows:

- Current status prominently
- Next action button (primary)
- Map with route to destination
- Rider contact options

**Technical Notes:**

- Create ActiveTripScreen component
- Update `complete-ride` Edge Function for final completion
- Record lat/lng with each status change
- This satisfies FR22, FR47, FR48

**Prerequisites:** Story 3.3

---

### Story 3.5: Implement Integrated Navigation

As a driver,
I want turn-by-turn navigation integrated in the app,
So that I don't have to switch between apps while driving.

**Acceptance Criteria:**

**Given** a driver is en route to pickup or destination
**When** they view the active trip
**Then** they see:

- Map with route displayed
- "Navigate" button to launch navigation

**Given** the driver taps "Navigate"
**When** navigation launches
**Then**:

- Google Maps or Apple Maps opens with directions
- Destination is pre-filled
- Driver can return to app easily

**Alternative:** In-app navigation display

- Turn-by-turn directions shown in app
- Voice guidance (if implemented)
- Distance and ETA visible

**Technical Notes:**

- Use deep linking to native maps apps
- `Linking.openURL('maps://?daddr=${lat},${lng}')`
- `Linking.openURL('google.navigation:q=${lat},${lng}')`
- Consider expo-maps for in-app route display
- This satisfies FR24

**Prerequisites:** Story 3.4

---

### Story 3.6: Implement Driver Contact Rider

As a driver,
I want to contact the rider before or during pickup,
So that I can communicate about arrival or delays.

**Acceptance Criteria:**

**Given** a driver has an assigned ride
**When** they view the trip detail
**Then** they see "Contact Rider" options

**Given** the driver taps contact
**When** they select call or text
**Then** the native phone/SMS app opens with rider's number

**And** contact is available during:

- En route to pickup
- Arrived at pickup
- In progress

**Technical Notes:**

- PhoneButton component variant
- Same implementation pattern as rider contact driver
- This satisfies FR23

**Prerequisites:** Story 3.2

---

### Story 3.7: Implement Driver Availability Schedule

As a driver,
I want to set my availability schedule,
So that I only receive ride assignments when I can work.

**Acceptance Criteria:**

**Given** a driver navigates to Schedule tab
**When** they view their availability
**Then** they see:

- Calendar view of their availability
- Toggle to set Available/Offline
- Recurring availability patterns

**Given** a driver sets recurring availability
**When** they configure their schedule
**Then** they can specify:

- Days of week available
- Hours each day (start/end times)
- Exceptions for specific dates

**And** the driver_availability table:

```sql
driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  specific_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**And** dispatch system respects availability when assigning rides

**Technical Notes:**

- Calendar component for visual schedule
- Real-time toggle syncs to database
- Dispatch queries availability before assignment
- This satisfies FR25, FR26, FR27

**Prerequisites:** Story 3.1

---

### Story 3.8: Implement Driver Earnings Dashboard

As a driver,
I want to see my earnings clearly,
So that I know how much I'm making and plan my finances.

**Acceptance Criteria:**

**Given** a driver navigates to Earnings tab
**When** the screen loads
**Then** they see:

- Today's earnings total
- This week's earnings total
- This month's earnings total
- Earnings chart/graph over time

**Given** a driver wants detailed breakdown
**When** they tap on a time period
**Then** they see:

- List of completed rides
- Earnings per ride
- Total miles driven
- Hours worked

**And** the earnings calculation:

- Driver earnings = ride price × driver percentage (e.g., 75%)
- Stored per ride in `driver_earnings_cents` column
- Calculated at ride completion

**Technical Notes:**

- EarningsDisplay component (UX P1)
- Query completed rides aggregated by period
- Show trends (up/down from previous period)
- This satisfies FR28, FR29

**Prerequisites:** Story 3.4

---

### Story 3.9: Implement Photo Arrival Confirmation

As a driver,
I want to capture a photo when the rider arrives safely,
So that families have visual confirmation and we have documentation.

**Acceptance Criteria:**

**Given** a driver completes a trip
**When** they mark the trip as completed
**Then** they are prompted to take a photo

**Given** the driver takes a photo
**When** the photo is captured
**Then**:

- Photo uploads to Supabase Storage
- Photo URL is attached to ride record
- Family members receive notification with photo
- Photo is accessible in ride history

**And** photo requirements:

- Uses device camera (expo-camera)
- Compressed before upload
- Stored in secure bucket with RLS
- Metadata includes timestamp and location

**Technical Notes:**

- Use `expo-camera` for photo capture
- Upload to `supabase.storage.from('arrival-photos')`
- Store photo_url in rides table
- This satisfies FR49

**Prerequisites:** Story 3.4

---

### Story 3.10: Implement No-Show Handling

As a driver,
I want to mark a ride as no-show when the rider doesn't appear,
So that the situation is documented and I can move to my next ride.

**Acceptance Criteria:**

**Given** a driver arrives at pickup location
**When** the rider does not appear after wait time
**Then** the driver can tap "Mark No-Show"

**Given** the driver marks no-show
**When** they confirm the action
**Then**:

- Status changes to 'no_show'
- Wait time duration is recorded
- Reason/notes can be added
- Dispatch is notified
- No-show entry created in database

**And** the no_shows table:

```sql
no_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) NOT NULL,
  driver_id UUID REFERENCES users(id) NOT NULL,
  rider_id UUID REFERENCES users(id) NOT NULL,
  wait_duration_minutes INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**And** system tracks no-show history per rider (FR53)

**Technical Notes:**

- ConfirmationModal for no-show action
- Process no-show Edge Function
- Alert dispatch for follow-up
- This satisfies FR51, FR53

**Prerequisites:** Story 3.4

---

### Story 3.11: Implement Driver Profile Management

As a driver,
I want to update my profile and vehicle information,
So that riders see accurate information about me.

**Acceptance Criteria:**

**Given** a driver navigates to Profile tab
**When** the screen loads
**Then** they see:

- Profile photo (editable)
- Name
- Vehicle information
- Bio (optional)

**Given** a driver updates their vehicle info
**When** they save changes
**Then**:

- driver_profiles table updates
- Changes visible to riders immediately

**And** vehicle information includes:

- Make, Model, Year
- Color
- License plate

**Technical Notes:**

- Photo upload to Supabase Storage
- Validate vehicle info format
- This satisfies FR74

**Prerequisites:** Story 3.1

---

### Story 3.12: Create Admin Console Shell and Navigation

As a dispatcher,
I want a web-based admin console for fleet management,
So that I can efficiently coordinate drivers and riders.

**Acceptance Criteria:**

**Given** the admin console is loaded
**When** user is authenticated with role 'dispatcher' or 'admin'
**Then** they see:

- Sidebar navigation: Dashboard, Dispatch, Rides, Riders, Drivers
- Header with user info and notifications
- Main content area

**And** the app structure follows Architecture:

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   ├── dispatch/
│   │   ├── rides/
│   │   ├── riders/
│   │   └── drivers/
│   ├── features/
│   │   ├── dispatch/
│   │   ├── rides/
│   │   ├── riders/
│   │   └── drivers/
│   └── components/
```

**And** shadcn/ui components are configured:

- Navigation menu
- Data tables
- Cards
- Modals

**Technical Notes:**

- Use Next.js App Router
- Clerk middleware for route protection
- TanStack Query for data fetching
- Supabase Realtime for live updates

**Prerequisites:** Epic 1 Complete

---

### Story 3.13: Implement Fleet Map View

As a dispatcher,
I want to see all drivers on a real-time map,
So that I can understand fleet positions and make smart assignments.

**Acceptance Criteria:**

**Given** a dispatcher views the Dispatch screen
**When** the map loads
**Then** they see:

- Map showing Raleigh-Durham area
- Driver markers for all active drivers
- Color-coded status: Available (green), On Trip (blue), Offline (gray)
- Ride pickup/dropoff markers

**Given** driver locations update
**When** new positions are received
**Then** markers animate to new positions in real-time

**Given** a dispatcher clicks on a driver marker
**When** the popup appears
**Then** they see:

- Driver name and photo
- Current status
- Current ride (if on trip)
- Quick actions (assign ride, view profile)

**And** real-time updates use:

- Supabase Realtime subscription to `fleet:active` channel
- Broadcast from driver location updates
- Efficient marker rendering

**Technical Notes:**

- Use Google Maps JavaScript API or Mapbox
- Subscribe to all driver location updates
- FleetMap component in `features/dispatch/`
- This satisfies FR31, FR32

**Prerequisites:** Story 3.12

---

### Story 3.14: Implement Ride Assignment and Reassignment

As a dispatcher,
I want to manually assign drivers to rides,
So that I can optimize matching based on my knowledge.

**Acceptance Criteria:**

**Given** a dispatcher views unassigned rides
**When** they select a ride
**Then** they see:

- Ride details
- List of available drivers
- Drivers sorted by proximity to pickup
- Preferred driver highlighted (if set)

**Given** a dispatcher assigns a driver
**When** they confirm the assignment
**Then**:

- `assign-driver` Edge Function is called
- Ride status changes to 'assigned'
- Driver receives notification
- Rider receives notification

**Given** a ride needs reassignment
**When** dispatcher selects "Reassign"
**Then**:

- Current driver is notified of reassignment
- New driver selection flow begins
- Original driver's ride is cleared

**Technical Notes:**

- DispatchBoard component with drag-drop (optional)
- Real-time ride list with status filters
- This satisfies FR34, FR35

**Prerequisites:** Story 3.13

---

### Story 3.15: Implement Phone Booking Management

As a dispatcher,
I want to create bookings from phone calls,
So that riders who prefer calling can still book rides.

**Acceptance Criteria:**

**Given** a phone call comes in
**When** the dispatcher answers
**Then** they can:

- Look up caller by phone number
- Create new rider if not found
- Create ride booking

**Given** caller ID is available
**When** dispatcher views incoming call
**Then** system suggests matching rider record

**Given** dispatcher creates a phone booking
**When** they save the ride
**Then**:

- Ride created with source='phone'
- Call logged in system
- Same booking flow as app booking

**And** phone call logging:

```sql
phone_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_phone TEXT NOT NULL,
  rider_id UUID REFERENCES users(id),
  handled_by UUID REFERENCES users(id),
  call_type TEXT CHECK (call_type IN ('booking', 'inquiry', 'support', 'confirmation')),
  notes TEXT,
  ride_id UUID REFERENCES rides(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Phone number search with fuzzy matching
- Quick rider creation form
- BookingManager component
- This satisfies FR7, FR45, FR46

**Prerequisites:** Story 3.14

---

### Story 3.16: Implement Rider Database Management

As a dispatcher,
I want to search and manage rider records,
So that I can provide good customer service.

**Acceptance Criteria:**

**Given** a dispatcher navigates to Riders section
**When** the screen loads
**Then** they see:

- Searchable list of all riders
- Search by name or phone number
- Filters for active/inactive

**Given** a dispatcher searches for a rider
**When** they enter search criteria
**Then** results update in real-time

**Given** a dispatcher views a rider profile
**When** the profile opens
**Then** they see:

- Contact information
- Saved destinations
- Ride history
- Preferences
- Family members
- Notes section (editable)

**Given** a dispatcher adds a note
**When** they save
**Then** note is visible to all dispatchers

**Technical Notes:**

- DataTable component with search
- RiderProfile detail view
- Notes stored in rider_notes table
- This satisfies FR38, FR39, FR40, FR41

**Prerequisites:** Story 3.12

---

### Story 3.17: Implement Ride Confirmation Calls

As a dispatcher,
I want to confirm upcoming rides via automated calls,
So that riders confirm or can cancel in advance.

**Acceptance Criteria:**

**Given** a ride is scheduled for 24 hours from now
**When** the confirmation job runs
**Then** an automated call is placed via Twilio

**Given** the rider answers the call
**When** they hear the confirmation message
**Then** they can:

- Press 1 to confirm
- Press 2 to cancel
- Press 0 to speak to someone

**Given** the rider confirms (presses 1)
**When** the confirmation is recorded
**Then**:

- Ride status changes to 'confirmed'
- Confirmation logged

**Given** the rider cancels (presses 2)
**When** the cancellation is recorded
**Then**:

- Ride status changes to 'cancelled'
- Dispatch notified

**Technical Notes:**

- Twilio Programmable Voice integration
- TwiML for call flow
- Webhook to handle responses
- This satisfies FR8

**Prerequisites:** Story 3.15

---

### Story 3.18: Implement No-Show Processing (Dispatch)

As a dispatcher,
I want to review and process no-show incidents,
So that appropriate follow-up actions are taken.

**Acceptance Criteria:**

**Given** a driver marks a ride as no-show
**When** the no-show is recorded
**Then** dispatch receives alert

**Given** a dispatcher reviews no-shows
**When** they view the no-show list
**Then** they see:

- Ride details
- Rider information
- Driver notes
- Wait time recorded

**Given** a dispatcher processes a no-show
**When** they take action
**Then** they can:

- Apply no-show fee (optional)
- Contact rider
- Add notes
- Mark as resolved

**Technical Notes:**

- No-show queue in Admin Console
- Integration with billing for fee application
- This satisfies FR52

**Prerequisites:** Story 3.10, Story 3.16

---

### Story 3.19: Implement Trip Documentation and Mileage Tracking

As the system,
I want to automatically record trip details and calculate mileage,
So that we have accurate documentation for compliance.

**Acceptance Criteria:**

**Given** a trip is completed
**When** the completion is processed
**Then** the system records:

- Actual pickup time (from 'arrived' event)
- Actual dropoff time (from 'completed' event)
- Pickup location coordinates
- Dropoff location coordinates
- Calculated mileage

**And** mileage calculation:

- Uses Google Distance Matrix API with actual coordinates
- OR calculates from recorded route (if available)
- Stored in `distance_miles` column

**And** trip log includes:

- All ride_events with timestamps
- Driver information
- Photo confirmation (if captured)
- Signature (future enhancement)

**Technical Notes:**

- Automatic calculation in `complete-ride` Edge Function
- Store all events for audit trail
- This satisfies FR47, FR48, FR50

**Prerequisites:** Story 3.4

---

**Epic 3 Complete**

**Stories Created:** 19
**FR Coverage:** FR7, FR8, FR19-FR53, FR74
**Technical Components:** Driver App, Admin Console, FleetMap, DispatchBoard, TripCard, RiderProfileCard, Phone Booking, No-Show Processing

---

## Epic 4: Family Support & Notifications

**Goal:** Enable family members to monitor their loved ones' rides with consent-based access, and ensure all users receive timely, relevant notifications throughout the ride lifecycle.

**FR Coverage:** FR13, FR14, FR15, FR16, FR17, FR18, FR75, FR76, FR77, FR78, FR79, FR80, FR81, FR82

---

### Story 4.1: Implement Family Member Linking

As a rider,
I want to grant family members access to view my rides,
So that they can have peace of mind without invading my privacy.

**Acceptance Criteria:**

**Given** a rider navigates to Profile → Family Access
**When** the screen loads
**Then** they see:

- List of linked family members
- "Add Family Member" button
- Status for each link (pending, approved)

**Given** a rider adds a family member
**When** they enter the family member's phone number
**Then**:

- Invitation sent via SMS
- Link status shows "Pending"
- Family member can accept in their app

**Given** a family member accepts the invitation
**When** they confirm in their app
**Then**:

- Link status changes to "Approved"
- Family member can view rider's rides
- Rider receives confirmation

**And** the family_links table:

```sql
family_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES users(id) NOT NULL,
  family_member_id UUID REFERENCES users(id) NOT NULL,
  relationship TEXT, -- 'daughter', 'son', 'spouse', etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revoked')),
  permissions JSONB DEFAULT '{"view_rides": true, "book_rides": false, "receive_notifications": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rider_id, family_member_id)
)
```

**Technical Notes:**

- Use Clerk for invitation flow
- SMS via Twilio for invitation link
- Respects rider autonomy (they control access)
- This satisfies FR17

**Prerequisites:** Story 2.12

---

### Story 4.2: Implement Family Access Revocation

As a rider,
I want to revoke family member access at any time,
So that I maintain control over my privacy.

**Acceptance Criteria:**

**Given** a rider views their linked family members
**When** they tap "Remove" on a family member
**Then** they see confirmation dialog

**Given** the rider confirms removal
**When** the action completes
**Then**:

- Link status changes to 'revoked'
- Family member loses access immediately
- Family member receives notification
- 60-second undo window appears

**And** revocation is immediate and complete:

- No more ride visibility
- No more notifications
- Historical access logged for audit

**Technical Notes:**

- ConfirmationModal with 60-second undo
- Update family_links status to 'revoked'
- Real-time sync removes data access
- This satisfies FR18

**Prerequisites:** Story 4.1

---

### Story 4.3: Implement Family Member Dashboard

As a family member,
I want to see my linked rider's upcoming and past rides,
So that I know they're getting to their appointments safely.

**Acceptance Criteria:**

**Given** a family member opens the rider app with 'family' role
**When** they view the home screen
**Then** they see:

- Linked riders they have access to
- Current/upcoming rides for each rider
- Ride status (upcoming, in progress, completed)

**Given** a family member views a rider's rides
**When** they tap on a ride
**Then** they see:

- Ride details (time, pickup, destination)
- Driver info (if assigned)
- Status timeline
- Arrival photo (if completed)

**And** family members CANNOT:

- Modify or cancel rides (unless permission granted)
- Access rider preferences
- Contact driver directly (rider does this)

**Technical Notes:**

- Family role sees filtered home screen
- RLS policies enforce visibility
- FamilyNotificationCard component
- This satisfies FR14

**Prerequisites:** Story 4.1

---

### Story 4.4: Implement Family Ride Booking

As a family member with booking permission,
I want to book rides on behalf of my loved one,
So that I can help manage their transportation.

**Acceptance Criteria:**

**Given** a family member has booking permission
**When** they view their linked rider
**Then** they see "Book a Ride" option

**Given** a family member books a ride
**When** they complete the booking flow
**Then**:

- Ride is created for the linked rider
- Rider receives confirmation notification
- Booking source shows 'family'
- Family member sees confirmation

**And** permission check:

```sql
-- Check booking permission
SELECT permissions->>'book_rides' = 'true'
FROM family_links
WHERE family_member_id = auth.uid() AND rider_id = :rider_id AND status = 'approved'
```

**Technical Notes:**

- Same BookingWizard, different rider context
- Clear indication "Booking for [Rider Name]"
- Audit log shows who booked
- This satisfies FR13

**Prerequisites:** Story 4.3, Epic 2 (BookingWizard)

---

### Story 4.5: Implement Notification Preferences

As a user,
I want to configure how I receive notifications,
So that I get updates in my preferred way.

**Acceptance Criteria:**

**Given** a user navigates to Profile → Notifications
**When** the screen loads
**Then** they see notification preferences:

- Push notifications: On/Off
- SMS notifications: On/Off
- Notification types:
  - Ride reminders
  - Driver assigned
  - Driver en route
  - Driver arrived
  - Ride completed

**Given** a user updates their preferences
**When** they save
**Then**:

- Preferences stored in notification_preferences table
- Future notifications respect preferences

**And** the notification_preferences table:

```sql
notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  reminders_enabled BOOLEAN DEFAULT true,
  driver_updates_enabled BOOLEAN DEFAULT true,
  arrival_photos_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Default to both push and SMS enabled
- Respect preferences in all notification sends
- This satisfies FR78

**Prerequisites:** Story 2.12

---

### Story 4.6: Implement Ride Reminder Notifications

As a rider,
I want to receive reminders before my scheduled rides,
So that I'm prepared and don't miss my transportation.

**Acceptance Criteria:**

**Given** a ride is scheduled
**When** 24 hours before the ride
**Then** rider receives reminder notification:

- "Reminder: You have a ride tomorrow at [time]"
- Push and/or SMS based on preferences

**Given** a ride is scheduled
**When** 1 hour before the ride
**Then** rider receives reminder notification:

- "Your ride is in 1 hour. Pickup at [location]"
- Driver info if assigned

**And** the notification system:

- Scheduled job checks for upcoming rides
- Sends via configured channels (push, SMS)
- Logs all sent notifications

**And** the notification_logs table:

```sql
notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  ride_id UUID REFERENCES rides(id),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('push', 'sms', 'email')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Use Supabase scheduled functions or external cron
- Expo Push Notifications for mobile push
- Twilio for SMS
- This satisfies FR75

**Prerequisites:** Story 4.5

---

### Story 4.7: Implement Driver Status Notifications

As a rider,
I want to receive notifications when my driver status changes,
So that I know when to be ready for pickup.

**Acceptance Criteria:**

**Given** a driver is assigned to a ride
**When** the assignment is confirmed
**Then** rider receives notification:

- "Your driver [Name] has been assigned"
- Includes driver photo and vehicle info

**Given** a driver marks 'en_route'
**When** the status changes
**Then** rider receives notification:

- "[Name] is on the way!"
- Includes ETA

**Given** a driver marks 'arrived'
**When** the status changes
**Then** rider receives notification:

- "[Name] has arrived"
- Includes vehicle info reminder

**And** notifications are triggered by:

- ride_events table INSERT triggers
- Edge Function sends notifications

**Technical Notes:**

- Database trigger on ride status change
- send-notification Edge Function
- Include driver photo in push notification
- This satisfies FR76, FR77

**Prerequisites:** Story 4.6, Story 3.4

---

### Story 4.8: Implement Driver Notifications

As a driver,
I want to receive notifications about my ride assignments,
So that I know when I have new work.

**Acceptance Criteria:**

**Given** a new ride is assigned to a driver
**When** the assignment is made
**Then** driver receives notification:

- "New ride assigned"
- Pickup time and location
- Rider name
- Deep link to ride detail

**Given** an assigned ride is cancelled
**When** the cancellation occurs
**Then** driver receives notification:

- "Ride cancelled"
- Ride details
- Reason (if provided)

**Given** an assigned ride is modified
**When** time or location changes
**Then** driver receives notification:

- "Ride updated"
- Shows what changed

**Technical Notes:**

- Driver app must register for push tokens
- Push notifications with data payload
- Handle notification tap to navigate
- This satisfies FR79, FR80

**Prerequisites:** Story 4.6, Story 3.2

---

### Story 4.9: Implement Family Pickup Notifications

As a family member,
I want to receive automatic notifications when my loved one is picked up,
So that I know their ride has started.

**Acceptance Criteria:**

**Given** a family member has notification permission
**When** the rider's ride status changes to 'in_progress'
**Then** family member receives notification:

- "[Rider Name] was picked up by [Driver Name]"
- Time of pickup
- Destination

**And** notification respects:

- Family link status (must be 'approved')
- Family member notification preferences
- Rider hasn't disabled family notifications

**Technical Notes:**

- Query family_links for approved members
- send-notification to each family member
- This satisfies FR81

**Prerequisites:** Story 4.1, Story 4.7

---

### Story 4.10: Implement Family Arrival Notifications with Photo

As a family member,
I want to receive notification with a photo when my loved one arrives safely,
So that I have visual confirmation and peace of mind.

**Acceptance Criteria:**

**Given** a ride is completed with photo confirmation
**When** the completion is processed
**Then** family members receive notification:

- "[Rider Name] arrived safely"
- Arrival time
- Location
- Photo attached (if captured)

**Given** a family member receives the notification
**When** they tap on it
**Then** they see:

- Full arrival photo
- Ride completion details
- Option to view ride history

**And** photo delivery:

- Compress image for notification
- Store full resolution for viewing
- Include thumbnail in push payload

**Technical Notes:**

- FamilyNotificationCard shows photo
- Image URL in notification payload
- Respect notification preferences
- This is the "emotional payoff" moment
- This satisfies FR15, FR16, FR82

**Prerequisites:** Story 3.9, Story 4.9

---

**Epic 4 Complete**

**Stories Created:** 10
**FR Coverage:** FR13, FR14, FR15, FR16, FR17, FR18, FR75, FR76, FR77, FR78, FR79, FR80, FR81, FR82
**Technical Components:** Family Linking, Notification System, Push + SMS Integration, FamilyNotificationCard

---

## Epic 5: Business Operations & Administration

**Goal:** Enable the business to operate profitably with accurate billing, driver payroll, credential management, compliance reporting, and system configuration.

**FR Coverage:** FR42, FR43, FR44, FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR83, FR84, FR85, FR86, FR87

---

### Story 5.1: Create Business Operations App Shell

As an admin,
I want a dedicated business operations web app,
So that I can manage billing, compliance, and configuration.

**Acceptance Criteria:**

**Given** the business ops app is loaded
**When** user is authenticated with role 'admin'
**Then** they see:

- Sidebar navigation: Dashboard, Billing, Drivers, Compliance, Settings
- Financial overview on dashboard
- Quick access to common actions

**And** the app structure:

```
apps/business/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   ├── billing/
│   │   ├── drivers/
│   │   ├── compliance/
│   │   └── settings/
│   ├── features/
│   └── components/
```

**Technical Notes:**

- Next.js App Router
- Admin-only access via Clerk middleware
- shadcn/ui for consistent design
- Separate from admin console (different focus)

**Prerequisites:** Epic 1 Complete

---

### Story 5.2: Implement Driver Roster Management

As an admin,
I want to view and manage the driver roster,
So that I maintain an active, qualified driver fleet.

**Acceptance Criteria:**

**Given** an admin navigates to Drivers section
**When** the screen loads
**Then** they see:

- List of all drivers (active and inactive)
- Driver status indicators
- Search and filter capabilities
- "Add Driver" button

**Given** an admin views a driver profile
**When** the profile opens
**Then** they see:

- Contact information
- Vehicle information
- Credential status (see Story 5.6)
- Performance metrics
- Earnings summary
- Ride history

**Given** an admin deactivates a driver
**When** they confirm the action
**Then**:

- Driver status changes to inactive
- Driver removed from assignment pool
- Active rides reassigned (with notification)
- Driver notified

**Technical Notes:**

- DataTable with status filters
- Driver detail drawer/modal
- Deactivation with reassignment logic
- This satisfies FR42, FR44

**Prerequisites:** Story 5.1

---

### Story 5.3: Implement Driver Onboarding

As an admin,
I want to onboard new drivers with proper documentation,
So that only qualified drivers can serve riders.

**Acceptance Criteria:**

**Given** an admin clicks "Add Driver"
**When** the onboarding form opens
**Then** they can enter:

- Personal information (name, phone, email)
- Vehicle information
- Credential documents (upload)
- Initial availability

**Given** an admin submits a new driver
**When** the driver is created
**Then**:

- User account created with 'driver' role
- Driver profile created
- Credential records created (pending verification)
- Welcome SMS/email sent to driver
- Driver can log into app

**And** onboarding checklist:

- [ ] Personal info complete
- [ ] Vehicle info complete
- [ ] Driver's license uploaded
- [ ] Insurance uploaded
- [ ] Background check initiated
- [ ] Profile photo uploaded

**Technical Notes:**

- Multi-step onboarding wizard
- File upload to Supabase Storage
- Credential tracking from start
- This satisfies FR43

**Prerequisites:** Story 5.2

---

### Story 5.4: Implement Invoice Generation

As the system,
I want to automatically generate invoices for completed rides,
So that billing is accurate and timely.

**Acceptance Criteria:**

**Given** a ride is completed
**When** invoice generation runs
**Then** an invoice is created with:

- Invoice number (sequential)
- Rider information
- Ride details (date, pickup, destination)
- Distance and duration
- Price breakdown
- Total amount due

**And** the invoices table:

```sql
invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  rider_id UUID REFERENCES users(id) NOT NULL,
  ride_id UUID REFERENCES rides(id),
  amount_cents INTEGER NOT NULL,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**And** invoice options:

- Per-ride invoicing (default)
- Weekly/monthly consolidated invoices (configurable)

**Technical Notes:**

- generate-invoice Edge Function
- PDF generation for downloadable invoices
- This satisfies FR57

**Prerequisites:** Story 5.1, Story 3.4

---

### Story 5.5: Implement Payment Processing

As a rider,
I want to pay for my rides via credit card,
So that payment is convenient and automatic.

**Acceptance Criteria:**

**Given** a rider needs to add a payment method
**When** they navigate to Profile → Payment
**Then** they can:

- Add credit/debit card via Stripe
- View saved payment methods
- Set default payment method
- Remove payment methods

**Given** an invoice is generated
**When** auto-pay is enabled
**Then**:

- Default card is charged
- Payment record created
- Invoice marked as paid
- Receipt sent to rider

**Given** a payment fails
**When** the charge is declined
**Then**:

- Invoice remains pending
- Rider notified
- Admin alerted for follow-up

**And** the payments table:

```sql
payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  rider_id UUID REFERENCES users(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_method_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Stripe Elements for card input
- Stripe Customer for saved cards
- process-payment Edge Function
- Webhook for async payment status
- This satisfies FR58

**Prerequisites:** Story 5.4

---

### Story 5.6: Implement Recurring Billing

As a rider with regular rides,
I want automatic recurring billing,
So that I don't have to pay for each ride individually.

**Acceptance Criteria:**

**Given** a rider has recurring rides
**When** billing period ends (weekly/monthly)
**Then**:

- Consolidated invoice generated
- All rides in period listed
- Total calculated
- Auto-pay charged if enabled

**Given** an admin views rider billing
**When** they select billing frequency
**Then** they can set:

- Per-ride billing
- Weekly billing
- Monthly billing

**Technical Notes:**

- Scheduled job for billing cycle
- Consolidation logic in generate-invoice
- This satisfies FR59

**Prerequisites:** Story 5.5

---

### Story 5.7: Implement Payment Account Management

As an admin,
I want to view and manage rider payment accounts,
So that I can resolve billing issues.

**Acceptance Criteria:**

**Given** an admin views a rider's billing
**When** they access payment management
**Then** they see:

- Payment history
- Outstanding balance
- Payment methods (masked)
- Invoice history

**Given** an admin needs to adjust billing
**When** they take action
**Then** they can:

- Apply credits
- Waive fees
- Process manual payment
- Generate statement

**Technical Notes:**

- Admin view of Stripe customer
- Audit log for all adjustments
- This satisfies FR60

**Prerequisites:** Story 5.5

---

### Story 5.8: Implement Driver Earnings Tracking

As an admin,
I want to track driver earnings for payroll,
So that drivers are paid accurately.

**Acceptance Criteria:**

**Given** a ride is completed
**When** earnings are calculated
**Then**:

- Driver earnings = ride price × driver percentage
- Recorded in driver_earnings table
- Visible in driver earnings dashboard

**Given** an admin views payroll
**When** they select a pay period
**Then** they see:

- Total earnings per driver
- Ride count
- Total miles
- Hours worked
- Deductions (if any)

**And** the driver_earnings table:

```sql
driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) NOT NULL,
  ride_id UUID REFERENCES rides(id) NOT NULL,
  gross_amount_cents INTEGER NOT NULL,
  company_fee_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Earnings calculated in complete-ride Edge Function
- Configurable driver percentage
- Export for payroll processing
- This satisfies FR61

**Prerequisites:** Story 5.4

---

### Story 5.9: Implement Driver Credential Management

As an admin,
I want to track driver credentials and expiration dates,
So that all drivers remain compliant.

**Acceptance Criteria:**

**Given** an admin views driver credentials
**When** they access the credentials section
**Then** they see:

- Driver's license (number, expiration)
- Vehicle insurance (provider, expiration)
- Background check (date, status)
- Any additional certifications

**Given** a credential is approaching expiration (30 days)
**When** the alert check runs
**Then**:

- Admin receives alert
- Driver receives reminder
- Dashboard shows warning indicator

**And** the driver_credentials table:

```sql
driver_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('drivers_license', 'insurance', 'background_check', 'vehicle_registration')),
  credential_number TEXT,
  issued_date DATE,
  expiration_date DATE,
  document_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Technical Notes:**

- Document upload to Supabase Storage
- Scheduled job for expiration checks
- This satisfies FR65, FR66, FR67

**Prerequisites:** Story 5.3

---

### Story 5.10: Implement Operational Reports

As an admin,
I want to view operational metrics,
So that I can monitor business performance.

**Acceptance Criteria:**

**Given** an admin views the dashboard
**When** operational metrics load
**Then** they see:

- Rides today/this week/this month
- On-time rate
- Completion rate
- No-show rate
- Average wait time
- Driver utilization

**Given** an admin wants detailed reports
**When** they access Reports section
**Then** they can generate:

- Daily operations summary
- Weekly performance report
- Driver performance comparison
- Rider activity report

**Technical Notes:**

- Aggregate queries with date ranges
- Charts using recharts or similar
- Export to CSV/PDF
- This satisfies FR62

**Prerequisites:** Story 5.1

---

### Story 5.11: Implement Financial Reports

As an admin,
I want to view financial metrics and reports,
So that I can track business profitability.

**Acceptance Criteria:**

**Given** an admin views financial dashboard
**When** the data loads
**Then** they see:

- Revenue (daily/weekly/monthly)
- Outstanding invoices
- Driver payments due
- Profit margin

**Given** an admin generates financial report
**When** they select parameters
**Then** the report shows:

- Total revenue by period
- Revenue by rider/source
- Driver payments
- Outstanding balances
- Refunds/credits

**Technical Notes:**

- Aggregate from invoices, payments, driver_earnings
- Period comparison (vs last period)
- This satisfies FR63

**Prerequisites:** Story 5.8

---

### Story 5.12: Implement Compliance Reporting

As an admin,
I want to generate compliance reports,
So that we meet regulatory requirements.

**Acceptance Criteria:**

**Given** an admin needs compliance documentation
**When** they access Compliance section
**Then** they can generate:

- Trip documentation completeness report
- Driver credential status report
- Audit log export
- HIPAA access report

**Given** a compliance report is generated
**When** export is requested
**Then**:

- Report generated in PDF/CSV format
- Includes all required fields
- Date range selectable
- Downloadable

**And** trip documentation includes:

- Pickup time/location
- Dropoff time/location
- Driver information
- Mileage
- Photo confirmation (if available)

**Technical Notes:**

- Export functionality for all ride data
- Audit log queries for access reports
- This satisfies FR56, FR64

**Prerequisites:** Story 5.10

---

### Story 5.13: Implement System Configuration - Service Area

As an admin,
I want to configure the service area,
So that rides are only booked within our operating region.

**Acceptance Criteria:**

**Given** an admin accesses Settings → Service Area
**When** the configuration opens
**Then** they can:

- View current service area on map
- Draw/edit polygon boundary
- Save service area

**Given** a rider tries to book outside service area
**When** address is selected
**Then**:

- Booking shows "Outside Service Area"
- Cannot proceed with booking
- Suggests calling for special arrangements

**And** the system_config table:

```sql
system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Example: service_area config
{
  "type": "Polygon",
  "coordinates": [[[lat, lng], [lat, lng], ...]]
}
```

**Technical Notes:**

- Map component for boundary editing
- PostGIS for geospatial queries
- calculate-price checks service area
- This satisfies FR83

**Prerequisites:** Story 5.1

---

### Story 5.14: Implement System Configuration - Pricing

As an admin,
I want to configure pricing parameters,
So that ride prices are calculated correctly.

**Acceptance Criteria:**

**Given** an admin accesses Settings → Pricing
**When** the configuration opens
**Then** they can configure:

- Base rate ($X per ride)
- Per mile rate ($X per mile)
- Wait time rate ($X per minute after included)
- Included wait time (default 20 minutes)
- Minimum fare

**Given** pricing is updated
**When** the admin saves
**Then**:

- New pricing takes effect immediately
- Existing booked rides keep original price
- Change logged in audit trail

**Technical Notes:**

- system_config with key 'pricing'
- calculate-price reads config
- Show preview of sample ride price
- This satisfies FR84

**Prerequisites:** Story 5.13

---

### Story 5.15: Implement System Configuration - Operating Hours

As an admin,
I want to configure operating hours,
So that rides can only be booked during business hours.

**Acceptance Criteria:**

**Given** an admin accesses Settings → Hours
**When** the configuration opens
**Then** they can configure:

- Operating days (e.g., Mon-Sat)
- Operating hours per day
- Holiday closures
- Extended hours (if any)

**Given** a rider tries to book outside operating hours
**When** they select a time
**Then**:

- Time picker shows unavailable times
- Cannot select times outside hours
- Shows next available time

**Technical Notes:**

- system_config with key 'operating_hours'
- TimePicker validates against config
- This satisfies FR85

**Prerequisites:** Story 5.14

---

### Story 5.16: Implement User Account Management

As an admin,
I want to manage dispatcher and admin accounts,
So that the right people have the right access.

**Acceptance Criteria:**

**Given** an admin accesses Settings → Users
**When** the screen loads
**Then** they see:

- List of admin/dispatcher users
- Role assignments
- "Invite User" button

**Given** an admin invites a new user
**When** they send the invitation
**Then**:

- Clerk invitation sent
- User can sign up with role assigned
- Appears in user list as pending

**Given** an admin needs to modify user access
**When** they edit a user
**Then** they can:

- Change role (dispatcher ↔ admin)
- Deactivate account
- Reset password (trigger reset email)

**Technical Notes:**

- Clerk Admin API for user management
- Role stored in Clerk metadata + users table
- This satisfies FR86, FR87

**Prerequisites:** Story 5.1

---

**Epic 5 Complete**

**Stories Created:** 16
**FR Coverage:** FR42, FR43, FR44, FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR83, FR84, FR85, FR86, FR87
**Technical Components:** Business Ops App, Billing System, Stripe Integration, Credential Management, Reporting, System Configuration

---

## FR Coverage Matrix

### Complete Coverage Verification

| FR   | Description                     | Epic | Story         |
| ---- | ------------------------------- | ---- | ------------- |
| FR1  | Book one-time ride              | 2    | 2.3, 2.4, 2.5 |
| FR2  | Book recurring rides            | 2    | 2.4, 2.5      |
| FR3  | Save destinations               | 2    | 2.2           |
| FR4  | View price before booking       | 2    | 2.5           |
| FR5  | Modify/cancel rides             | 2    | 2.6           |
| FR6  | Request specific driver         | 2    | 2.7           |
| FR7  | Phone booking                   | 3    | 3.15          |
| FR8  | Confirmation calls              | 3    | 3.17          |
| FR9  | View upcoming rides             | 2    | 2.8           |
| FR10 | See driver info                 | 2    | 2.9           |
| FR11 | Track driver location           | 2    | 2.10          |
| FR12 | Contact driver                  | 2    | 2.11          |
| FR13 | Family booking                  | 4    | 4.4           |
| FR14 | Family view rides               | 4    | 4.3           |
| FR15 | Family pickup notification      | 4    | 4.9, 4.10     |
| FR16 | Family arrival + photo          | 4    | 4.10          |
| FR17 | Designate family access         | 4    | 4.1           |
| FR18 | Revoke family access            | 4    | 4.2           |
| FR19 | Driver trip queue               | 3    | 3.2           |
| FR20 | Driver sees rider profile       | 3    | 3.2           |
| FR21 | Accept/decline rides            | 3    | 3.3           |
| FR22 | Trip status transitions         | 3    | 3.4           |
| FR23 | Driver contact rider            | 3    | 3.6           |
| FR24 | Integrated navigation           | 3    | 3.5           |
| FR25 | Availability schedule           | 3    | 3.7           |
| FR26 | Block time off                  | 3    | 3.7           |
| FR27 | View schedule                   | 3    | 3.7           |
| FR28 | Earnings summary                | 3    | 3.8           |
| FR29 | Earnings per ride               | 3    | 3.8           |
| FR30 | Performance metrics             | 3    | 3.8           |
| FR31 | Fleet map                       | 3    | 3.13          |
| FR32 | Driver status                   | 3    | 3.13          |
| FR33 | Daily rides view                | 3    | 3.14          |
| FR34 | Manual assignment               | 3    | 3.14          |
| FR35 | Reassign rides                  | 3    | 3.14          |
| FR36 | Dispatcher booking              | 3    | 3.15          |
| FR37 | Dispatcher modify/cancel        | 3    | 3.15          |
| FR38 | Rider search                    | 3    | 3.16          |
| FR39 | View rider profile              | 3    | 3.16          |
| FR40 | Add rider notes                 | 3    | 3.16          |
| FR41 | Create rider accounts           | 3    | 3.16          |
| FR42 | Manage driver roster            | 5    | 5.2           |
| FR43 | Onboard drivers                 | 5    | 5.3           |
| FR44 | Deactivate drivers              | 5    | 5.2           |
| FR45 | Log phone calls                 | 3    | 3.15          |
| FR46 | Caller ID booking               | 3    | 3.15          |
| FR47 | Record pickup time              | 3    | 3.4, 3.19     |
| FR48 | Record dropoff time             | 3    | 3.4, 3.19     |
| FR49 | Photo documentation             | 3    | 3.9           |
| FR50 | Calculate mileage               | 3    | 3.19          |
| FR51 | Mark no-show                    | 3    | 3.10          |
| FR52 | Process no-shows                | 3    | 3.18          |
| FR53 | Track no-show history           | 3    | 3.10          |
| FR54 | Log data access                 | 1    | 1.5           |
| FR55 | Audit trail                     | 1    | 1.5           |
| FR56 | Compliance reports              | 5    | 5.12          |
| FR57 | Generate invoices               | 5    | 5.4           |
| FR58 | Credit card payment             | 5    | 5.5           |
| FR59 | Recurring billing               | 5    | 5.6           |
| FR60 | Manage payment accounts         | 5    | 5.7           |
| FR61 | Track driver earnings           | 5    | 5.8           |
| FR62 | Operational reports             | 5    | 5.10          |
| FR63 | Financial reports               | 5    | 5.11          |
| FR64 | Export ride data                | 5    | 5.12          |
| FR65 | Store credentials               | 5    | 5.9           |
| FR66 | Credential alerts               | 5    | 5.9           |
| FR67 | Verify credentials              | 5    | 5.9           |
| FR68 | Phone registration              | 1    | 1.3           |
| FR69 | SMS authentication              | 1    | 1.3           |
| FR70 | Role-based access               | 1    | 1.4           |
| FR71 | Update rider profile            | 2    | 2.12          |
| FR72 | Accessibility prefs             | 2    | 2.13          |
| FR73 | Comfort prefs                   | 2    | 2.14          |
| FR74 | Update driver profile           | 3    | 3.11          |
| FR75 | Ride reminders                  | 4    | 4.6           |
| FR76 | Driver en route notification    | 4    | 4.7           |
| FR77 | Driver arrived notification     | 4    | 4.7           |
| FR78 | Notification preferences        | 4    | 4.5           |
| FR79 | Driver assignment notification  | 4    | 4.8           |
| FR80 | Driver ride change notification | 4    | 4.8           |
| FR81 | Family pickup notification      | 4    | 4.9           |
| FR82 | Family arrival notification     | 4    | 4.10          |
| FR83 | Service area config             | 5    | 5.13          |
| FR84 | Pricing config                  | 5    | 5.14          |
| FR85 | Operating hours config          | 5    | 5.15          |
| FR86 | Manage admin accounts           | 5    | 5.16          |
| FR87 | Reset passwords                 | 5    | 5.16          |

**Coverage: 87/87 FRs (100%)**

---

## Implementation Summary

### Total Stories by Epic

| Epic      | Title                                | Stories        | FR Coverage       |
| --------- | ------------------------------------ | -------------- | ----------------- |
| 1         | Foundation & Infrastructure          | 6              | 5 FRs             |
| 2         | Rider Booking Experience             | 14             | 13 FRs            |
| 3         | Driver & Dispatch Operations         | 19             | 37 FRs            |
| 4         | Family Support & Notifications       | 10             | 14 FRs            |
| 5         | Business Operations & Administration | 16             | 22 FRs            |
| **Total** |                                      | **65 Stories** | **87 FRs (100%)** |

### Recommended Implementation Order

1. **Epic 1: Foundation** (6 stories) — Must complete first
2. **Epic 2: Rider Booking** (14 stories) — Core user experience
3. **Epic 3: Driver & Dispatch** (19 stories) — Operations capability
4. **Epic 4: Family & Notifications** (10 stories) — Enhanced experience
5. **Epic 5: Business Operations** (16 stories) — Business sustainability

### Critical Path Stories

These stories are on the critical path and should be prioritized:

1. **1.1** Initialize Monorepo → All other work
2. **1.3** Clerk Authentication → All user features
3. **2.5** 3-Tap Booking Confirmation → Core value proposition
4. **3.4** Trip Status Transitions → Real-time operations
5. **4.10** Family Arrival + Photo → Emotional payoff

### Architecture Alignment Checklist

- [x] Monorepo with Turborepo
- [x] Feature-first organization
- [x] Supabase + PostgreSQL + RLS
- [x] Clerk for authentication
- [x] Drizzle ORM for schema
- [x] TanStack Query + Zustand
- [x] Edge Functions for business logic
- [x] Expo + NativeWind for mobile
- [x] Next.js + shadcn/ui for web

### UX Design Alignment Checklist

- [x] 3-Tap Booking flow
- [x] "Warm & Minimal" design direction
- [x] 48dp+ touch targets
- [x] PhoneButton always visible
- [x] PriceLockBadge component
- [x] DriverCard with relationship history
- [x] StatusTimeline component
- [x] Family photo confirmation
- [x] Accessibility standards (WCAG AA+)

---

**Document Complete**

_Generated: 2025-12-06_
_Total: 65 Stories covering 87 Functional Requirements_
_Ready for Sprint Planning_
