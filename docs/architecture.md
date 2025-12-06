---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - 'docs/prd.md'
  - 'docs/ux-design-specification.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2025-12-06'
project_name: 'veterans-first-app'
user_name: 'Wayne'
date: '2025-12-05'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

87 functional requirements across 9 capability areas define a comprehensive NEMT transportation platform:

| Capability Area | FR Count | Architectural Implications |
|-----------------|----------|---------------------------|
| Ride Booking & Management | 12 | Booking engine, recurring ride scheduler, price calculator |
| Family & Caregiver Support | 6 | Consent-based access control, notification routing |
| Driver Operations | 12 | Mobile-optimized workflows, GPS tracking, offline queuing |
| Dispatch & Admin Operations | 16 | Real-time fleet visibility, manual override capabilities |
| Trip Documentation & Compliance | 10 | Audit logging, photo storage, immutable trip records |
| Business Operations | 11 | Payment processing, invoicing, credential management |
| User Account Management | 7 | Phone-based identity, RBAC, family linking |
| Notifications & Communications | 8 | Multi-channel orchestration (Push, SMS, Phone) |
| System Administration | 5 | Configuration management, access control |

**Non-Functional Requirements:**

| Category | Requirement | Architectural Impact |
|----------|-------------|---------------------|
| Performance | <3s app launch, <500ms transitions | Code splitting, optimized bundles, CDN |
| Availability | 99.9% API uptime | Serverless architecture, health monitoring |
| Scalability | 50→1000 concurrent users | Connection pooling, horizontal scaling |
| Security | HIPAA technical safeguards | Encryption at rest/transit, RLS, audit logs |
| Accessibility | WCAG 2.1 AA+ | Semantic markup, ARIA, keyboard navigation |
| Offline | View cached rides/profiles | Local storage, sync queue, conflict resolution |

**Scale & Complexity:**

- Primary domain: Full-Stack Mobile + Web (Multi-App Ecosystem)
- Complexity level: HIGH
- Estimated architectural components: 15-20 major modules

### Technical Constraints & Dependencies

**Pre-Selected Technology Stack:**

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile | React Native Expo (SDK 54+), NativeWind | Cross-platform apps |
| Web | Next.js 15+, Tailwind CSS, shadcn/ui | Admin Console, Business Ops |
| Auth | Clerk | Phone-first authentication, RBAC |
| Database | Supabase (PostgreSQL + Realtime + RLS) | Source of truth, real-time sync |
| State (Server) | TanStack Query | API caching, optimistic updates, offline persistence |
| State (Client) | Zustand | UI state, preferences, offline action queue |
| Cloud | Azure | Hosting, storage, CDN |
| Payments | Stripe | Payment processing |
| Communications | Twilio (SMS), Expo Notifications (Push) | Multi-channel notifications |
| Maps | Google Maps Platform, Expo Maps | Geocoding, navigation, display |

**State Management Architecture:**

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Server State | TanStack Query | API responses, ride data, driver locations, mutations with optimistic updates |
| Client State | Zustand | UI state, user preferences, offline action queue, navigation state |
| Persistence | AsyncStorage | Both Zustand and Query persist to AsyncStorage |
| Source of Truth | Supabase | Database, Realtime subscriptions, Row Level Security |

**Platform Constraints:**

- iOS 14+ and Android 10+ minimum
- Modern browsers only (no IE11)
- Mobile apps require physical device testing for push/GPS

**Regulatory Constraints:**

- HIPAA: PHI encryption, access logging, breach notification capability
- NEMT: Trip documentation, driver credentialing, mileage tracking
- App Store: Privacy nutrition labels, permission justifications

### Cross-Cutting Concerns Identified

| Concern | Scope | Strategy |
|---------|-------|----------|
| **Authentication** | All apps | Clerk with phone-first, JWT + refresh tokens |
| **Authorization** | All data access | Supabase RLS policies per role |
| **Audit Logging** | PHI operations | Custom logging table + Supabase audit |
| **Real-time Sync** | Fleet, rides, status | Supabase Realtime WebSocket channels |
| **Server State** | API data | TanStack Query with AsyncStorage persistence |
| **Client State** | UI/preferences | Zustand with AsyncStorage persistence |
| **Notifications** | All user types | Expo Push + Twilio SMS fallback |
| **Offline Support** | Mobile apps | Query cache + Zustand queue, sync on reconnect |
| **Error Handling** | All surfaces | Graceful degradation, human escalation |
| **Observability** | All services | Structured logging, health checks, alerting |

## Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Mobile + Web (Multi-App Ecosystem)** — 4 applications requiring shared code and consistent patterns.

### Starter Options Considered

| Starter | Platform | Includes | Selection Rationale |
|---------|----------|----------|---------------------|
| **Create Expo Stack** | Mobile | Expo Router, NativeWind | Interactive CLI, modern stack, aligns with tech choices |
| **create-expo-app** | Mobile | Base Expo, TypeScript | Official but requires more manual setup |
| **create-next-app** | Web | App Router, TypeScript, Tailwind | Official, production-ready, App Router default |

### Selected Starters

#### Mobile Apps (Rider + Driver): Create Expo Stack

**Initialization Commands:**

```bash
# Rider App
npx create-expo-stack@latest rider-app --expo-router --nativewind --npm

# Driver App
npx create-expo-stack@latest driver-app --expo-router --nativewind --npm
```

**Additional Dependencies:**

```bash
# Core dependencies
npx expo install @clerk/clerk-expo @supabase/supabase-js @react-native-async-storage/async-storage

# State management
npm install @tanstack/react-query zustand

# Persistence
npm install @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

#### Web Apps (Admin Console + Business Ops): create-next-app + shadcn/ui

**Initialization Commands:**

```bash
# Admin Console
npx create-next-app@latest admin-console --ts --tailwind --eslint --app --src-dir --use-npm

# Business Ops
npx create-next-app@latest business-ops --ts --tailwind --eslint --app --src-dir --use-npm
```

**Additional Setup:**

```bash
# Add shadcn/ui
npx shadcn@latest init

# Add dependencies
npm install @clerk/nextjs @supabase/supabase-js @tanstack/react-query zustand
```

### Architectural Decisions Provided by Starters

| Category | Mobile (Expo Stack) | Web (Next.js) |
|----------|---------------------|---------------|
| **Language** | TypeScript | TypeScript |
| **Routing** | Expo Router (file-based) | App Router (file-based) |
| **Styling** | NativeWind (Tailwind for RN) | Tailwind CSS + shadcn/ui |
| **Build Tool** | Metro + EAS | Turbopack |
| **Linting** | ESLint | ESLint |
| **Package Manager** | npm | npm |

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Repository structure: Monorepo with Turborepo
- API layer pattern: Hybrid (Direct Client + Edge Functions)
- Auth integration: Clerk → Supabase JWT
- Schema management: Drizzle ORM

**Important Decisions (Shape Architecture):**
- Audit logging strategy
- Real-time channel design
- Shared package structure
- Deployment pipeline

**Deferred Decisions (Post-MVP):**
- Advanced caching strategies
- Multi-region deployment
- Analytics platform selection

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Schema Management** | Drizzle ORM | Type-safe, lightweight, SQL-like syntax, excellent Supabase/PostgreSQL support |
| **Migrations** | Drizzle Kit + Supabase CLI | Drizzle for schema, Supabase CLI for RLS policies and Edge Functions |
| **Type Generation** | Drizzle inference + `supabase gen types` | Best of both: Drizzle for app code, Supabase types for RLS |
| **API Layer** | Hybrid | Direct client for reads/real-time, Edge Functions for business logic |

**API Layer Pattern:**

| Direct Supabase Client (RLS) | Supabase Edge Functions |
|------------------------------|-------------------------|
| Read rides, profiles | Book ride (complex transaction) |
| Real-time subscriptions | Process payment |
| Simple updates | Send notifications |
| Driver location tracking | Calculate pricing |
| | Driver assignment |
| | Stripe/Twilio webhooks |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth Flow** | Clerk + Supabase JWT integration | Clerk issues JWT, Supabase validates via custom JWT template |
| **RLS Strategy** | Role-based policies | Roles: rider, driver, family, dispatch, admin — enforced at database level |
| **Audit Logging** | Custom `audit_logs` table + triggers | HIPAA compliance, immutable records, triggered on PHI access |
| **API Security** | Clerk middleware + RLS | Defense in depth: auth at edge, RLS at database |
| **Encryption** | Supabase default | AES-256 at rest, TLS 1.3 in transit — HIPAA compliant |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Edge Function Organization** | Feature-based | `/functions/booking`, `/functions/payments`, `/functions/notifications` |
| **Error Handling** | Typed error codes + user-friendly messages | Consistent across apps, graceful degradation to phone |
| **Real-time Channels** | Per-entity scoping | `ride:{id}`, `driver:{id}:location`, `fleet:status` |
| **Webhook Handling** | Edge Functions with signature verification | Stripe, Twilio webhook endpoints |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Component Organization** | Feature-first | `/features/booking`, `/features/rides`, `/features/profile` |
| **Shared Code** | `packages/shared` in monorepo | Types, utils, API client, Supabase config |
| **Form Handling** | React Hook Form + Zod | Type-safe, performant, works on web and mobile |
| **Error Boundaries** | Per-feature with fallback UI | Graceful degradation, "Call Us" escalation |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Repository Structure** | Monorepo with Turborepo | Shared packages, coordinated deploys, single PR for cross-app changes |
| **Mobile Builds** | EAS Build | Managed builds, OTA updates, app store submissions |
| **Web Hosting** | Vercel | Native Next.js support, edge functions |
| **Edge Functions** | Supabase Edge Functions (Deno) | Integrated with database, no separate infra |
| **CI/CD** | GitHub Actions | → EAS (mobile) + Vercel (web) on PR merge |
| **Environment Config** | `.env.local` + Turborepo env inheritance | Consistent across apps, secrets in CI/CD |
| **Monitoring** | Sentry + Supabase Dashboard + Vercel Analytics | Error tracking, database metrics, web analytics |

### Monorepo Structure

```
veterans-first/
├── apps/
│   ├── rider/              # Expo - Rider mobile app
│   ├── driver/             # Expo - Driver mobile app
│   ├── admin/              # Next.js - Admin Console
│   └── business/           # Next.js - Business Ops
├── packages/
│   ├── shared/             # Types, utils, API client, Supabase config
│   ├── ui/                 # Shared UI components (adapted per platform)
│   └── config/             # ESLint, TypeScript configs
├── supabase/
│   ├── migrations/         # Drizzle migrations
│   ├── functions/          # Edge Functions
│   └── seed.sql            # Development seed data
├── turbo.json
├── package.json
└── .github/workflows/
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Turborepo monorepo structure
2. Set up Supabase project + Drizzle schema
3. Configure Clerk + Supabase JWT integration
4. Create `packages/shared` with types and API client
5. Initialize mobile apps (Rider, Driver)
6. Initialize web apps (Admin, Business)
7. Implement core Edge Functions
8. Set up CI/CD pipelines

**Cross-Component Dependencies:**

- All apps depend on `packages/shared` for types and Supabase client
- Edge Functions depend on Drizzle schema types
- Mobile apps share auth flow patterns
- Web apps share Clerk middleware configuration

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming:**

| Category | Convention | Example |
|----------|------------|---------|
| Tables | snake_case, plural | `rides`, `driver_profiles`, `audit_logs` |
| Columns | snake_case | `user_id`, `created_at`, `pickup_address` |
| Foreign Keys | `{table}_id` | `rider_id`, `driver_id` |
| Indexes | `idx_{table}_{columns}` | `idx_rides_rider_id` |
| RLS Policies | `{action}_{role}_{table}` | `select_rider_rides`, `insert_admin_users` |

**API Naming:**

| Category | Convention | Example |
|----------|------------|---------|
| Endpoints | kebab-case, plural nouns | `/api/rides`, `/api/driver-profiles` |
| Edge Functions | kebab-case | `book-ride`, `process-payment` |
| Query Params | camelCase | `?riderId=123&includeDriver=true` |
| Route Params | `[id]` or `[slug]` | `/rides/[id]`, `/drivers/[driverId]` |

**Code Naming:**

| Category | Convention | Example |
|----------|------------|---------|
| React Components | PascalCase | `RideCard`, `BookingWizard` |
| Component Files | PascalCase.tsx | `RideCard.tsx`, `BookingWizard.tsx` |
| Hooks | camelCase, `use` prefix | `useRides`, `useDriverLocation` |
| Utilities | camelCase | `formatPrice`, `calculateDistance` |
| Types/Interfaces | PascalCase | `Ride`, `DriverProfile`, `BookingRequest` |
| Zustand Stores | camelCase, `use` prefix | `useAppStore`, `useBookingStore` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_WAIT_TIME`, `DEFAULT_RADIUS` |

### Structure Patterns

**Feature-First Organization:**

```text
apps/rider/src/
├── features/
│   ├── booking/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   └── booking.store.ts
│   ├── rides/
│   ├── profile/
│   └── notifications/
├── components/
├── hooks/
├── lib/
└── app/
```

**Test Colocation:**

Tests live alongside source files:

- `BookingWizard.tsx` → `BookingWizard.test.tsx`
- `useBooking.ts` → `useBooking.test.ts`

### Format Patterns

**API Response Format:**

```typescript
// Success
{ data: { ride: {...} }, error: null }

// Error
{
  data: null,
  error: {
    code: "BOOKING_CONFLICT",
    message: "Driver unavailable at this time",
    details?: {...}
  }
}
```

**Date/Time Standards:**

- Database: `timestamptz` (PostgreSQL)
- JSON/API: ISO 8601 strings (`"2025-12-05T14:30:00Z"`)
- Display: Formatted via `date-fns` at UI layer

**JSON Field Naming:**

- API responses: camelCase
- Database columns: snake_case
- Drizzle handles mapping automatically

### Communication Patterns

**Supabase Realtime Channels:**

| Channel Pattern | Use Case |
|-----------------|----------|
| `ride:{id}` | Single ride updates |
| `driver:{id}:location` | Driver GPS updates |
| `fleet:active` | All active rides (dispatch) |
| `user:{id}:notifications` | User notifications |

**TanStack Query Keys:**

```typescript
export const rideKeys = {
  all: ['rides'] as const,
  lists: () => [...rideKeys.all, 'list'] as const,
  list: (filters: RideFilters) => [...rideKeys.lists(), filters] as const,
  details: () => [...rideKeys.all, 'detail'] as const,
  detail: (id: string) => [...rideKeys.details(), id] as const,
}
```

**Zustand Store Pattern:**

```typescript
interface BookingStore {
  // State
  currentBooking: Booking | null
  isLoading: boolean

  // Actions (imperative verbs)
  setCurrentBooking: (booking: Booking) => void
  clearBooking: () => void
  submitBooking: (request: BookingRequest) => Promise<void>
}
```

### Process Patterns

**Error Codes:**

```typescript
type ErrorCode =
  | 'BOOKING_CONFLICT'
  | 'DRIVER_UNAVAILABLE'
  | 'PAYMENT_FAILED'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
```

**Error Structure:**

```typescript
interface AppError {
  code: ErrorCode
  message: string           // User-friendly
  technicalMessage?: string // For logging
  recoverable: boolean
  action?: 'retry' | 'call_support' | 'login'
}
```

**Loading States:**

- Use TanStack Query states: `isLoading`, `isFetching`, `isPending`
- UI Pattern: Skeleton → Content → Error boundary

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow naming conventions exactly — no variations
2. Place new features in `/features/{name}/` structure
3. Use the standard API response wrapper format
4. Implement error handling with typed error codes
5. Use query key factories for TanStack Query
6. Co-locate tests with source files

**Linting/Formatting:**

- ESLint + Prettier configured in `packages/config`
- Husky pre-commit hooks enforce formatting
- CI fails on lint errors

## Project Structure & Boundaries

### Complete Monorepo Structure

```text
veterans-first/
├── README.md
├── package.json
├── turbo.json
├── .gitignore
├── .npmrc
├── .nvmrc
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-mobile.yml
│       └── deploy-web.yml
│
├── apps/
│   ├── rider/                    # Expo - Rider Mobile App
│   ├── driver/                   # Expo - Driver Mobile App
│   ├── admin/                    # Next.js - Admin Console
│   └── business/                 # Next.js - Business Ops
│
├── packages/
│   ├── shared/                   # Types, utils, API client
│   ├── ui/                       # Shared UI components
│   └── config/                   # ESLint, TypeScript, Prettier
│
└── supabase/
    ├── config.toml
    ├── migrations/               # Drizzle migrations
    ├── functions/                # Edge Functions
    └── seed.sql
```

### Mobile App Structure (apps/rider, apps/driver)

```text
apps/rider/
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── eas.json
├── .env.local
│
├── app/                          # Expo Router
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── rides.tsx
│   │   ├── profile.tsx
│   │   └── help.tsx
│   └── rides/
│       └── [id].tsx
│
├── src/
│   ├── features/
│   │   ├── booking/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   └── booking.store.ts
│   │   ├── rides/
│   │   ├── profile/
│   │   ├── family/
│   │   └── notifications/
│   │
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── stores/
│   └── utils/
│
└── assets/
```

### Web App Structure (apps/admin, apps/business)

```text
apps/admin/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── .env.local
│
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   ├── dispatch/
│   │   ├── riders/
│   │   ├── drivers/
│   │   ├── bookings/
│   │   └── settings/
│   │
│   ├── features/
│   │   ├── dispatch/
│   │   ├── riders/
│   │   ├── drivers/
│   │   └── bookings/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── lib/
│   └── middleware.ts
│
└── public/
```

### Shared Packages Structure

```text
packages/shared/
├── src/
│   ├── types/
│   │   ├── ride.ts
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   ├── payment.ts
│   │   └── errors.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── rides.ts
│   │   ├── bookings.ts
│   │   ├── users.ts
│   │   └── queryKeys.ts
│   ├── utils/
│   └── hooks/

packages/ui/
├── src/
│   ├── primitives/
│   └── patterns/

packages/config/
├── eslint/
├── typescript/
└── prettier/
```

### Supabase Structure

```text
supabase/
├── config.toml
├── seed.sql
├── migrations/
│   ├── 0001_create_users.sql
│   ├── 0002_create_rides.sql
│   ├── 0003_create_payments.sql
│   ├── 0004_create_audit_logs.sql
│   └── 0005_rls_policies.sql
└── functions/
    ├── _shared/
    ├── book-ride/
    ├── cancel-ride/
    ├── assign-driver/
    ├── complete-ride/
    ├── process-payment/
    ├── send-notification/
    ├── webhook-stripe/
    └── webhook-twilio/
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Location | Access Pattern |
|----------|----------|----------------|
| Client → Database | Direct via Supabase RLS | Reads, simple updates |
| Client → Business Logic | Edge Functions | Complex operations |
| External → System | Webhook Edge Functions | Stripe, Twilio callbacks |

**Data Boundaries:**

| Data Type | Access Control | Storage |
|-----------|---------------|---------|
| User PHI | RLS per user/role | Supabase (encrypted) |
| Ride Data | RLS: rider, driver, family | Supabase |
| Payment Data | RLS: admin only | Supabase + Stripe |
| Audit Logs | RLS: admin only, append-only | Supabase |

### FR Category to Structure Mapping

| FR Category | Primary Location |
|-------------|------------------|
| Ride Booking & Management | `apps/rider/src/features/booking/`, `supabase/functions/book-ride/` |
| Family & Caregiver Support | `apps/rider/src/features/family/` |
| Driver Operations | `apps/driver/src/features/` |
| Dispatch & Admin Operations | `apps/admin/src/features/dispatch/` |
| Trip Documentation & Compliance | `supabase/migrations/*audit*` |
| Business Operations | `apps/business/src/features/` |
| User Account Management | Clerk + `packages/shared/src/api/users.ts` |
| Notifications & Communications | `supabase/functions/send-notification/` |
| System Administration | `apps/admin/src/app/settings/` |

### Integration Points

**Internal Communication:**

- All apps import from `@veterans-first/shared`
- Mobile apps use Supabase Realtime for live updates
- Web apps use TanStack Query with server-side prefetching

**External Integrations:**

| Service | Integration Point | Purpose |
|---------|-------------------|---------|
| Clerk | `apps/*/src/lib/clerk.ts` | Authentication |
| Stripe | `supabase/functions/webhook-stripe/` | Payments |
| Twilio | `supabase/functions/send-notification/` | SMS |
| Google Maps | `apps/*/src/lib/maps.ts` | Geocoding, navigation |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
All technology choices work together without conflicts:
- React Native Expo + NativeWind aligns with Tailwind CSS on web
- Clerk authentication integrates cleanly with Supabase via JWT templates
- Drizzle ORM provides type-safe schema management for PostgreSQL
- TanStack Query + Zustand state management works across React Native and Next.js
- Turborepo monorepo enables shared packages across all 4 apps

**Pattern Consistency:**
Implementation patterns support architectural decisions:
- Feature-first organization aligns with feature-based Edge Functions
- Query key factories work with TanStack Query caching strategy
- Zustand store patterns complement server state management
- Naming conventions are consistent across database, API, and code layers

**Structure Alignment:**
Project structure supports all architectural decisions:
- Monorepo structure enables code sharing via `packages/shared`
- Mobile and web apps follow parallel organization patterns
- Supabase directory structure supports Drizzle migrations + Edge Functions
- Feature boundaries respect data access patterns (RLS policies)

### Requirements Coverage Validation

**Functional Requirements Coverage:**
All 87 FRs across 9 categories are architecturally supported:

| Category | FR Count | Architecture Support |
|----------|----------|---------------------|
| Ride Booking & Management | 12 | `features/booking/`, Edge Functions, Supabase Realtime |
| Family & Caregiver Support | 6 | `features/family/`, RLS policies, Clerk roles |
| Driver Operations | 12 | `apps/driver/`, GPS tracking, offline queue |
| Dispatch & Admin Operations | 16 | `apps/admin/`, real-time fleet channels |
| Trip Documentation & Compliance | 10 | `audit_logs` table, Supabase storage |
| Business Operations | 11 | `apps/business/`, Stripe integration |
| User Account Management | 7 | Clerk phone-first auth, RBAC |
| Notifications & Communications | 8 | Twilio + Expo Push Edge Functions |
| System Administration | 5 | Admin console settings module |

**Non-Functional Requirements Coverage:**

| NFR | Architecture Support |
|-----|---------------------|
| Performance (<3s launch) | Code splitting, Turborepo caching, CDN |
| Availability (99.9%) | Supabase managed infra, Vercel edge |
| Scalability (50→1000 users) | Serverless Edge Functions, connection pooling |
| Security (HIPAA) | Supabase encryption, RLS, audit logging |
| Accessibility (WCAG 2.1 AA) | shadcn/ui accessibility, NativeWind semantic |
| Offline Support | TanStack Query + Zustand persistence |

### Implementation Readiness Validation

**Decision Completeness:**
- All critical decisions documented with specific versions
- Implementation patterns comprehensive with code examples
- Consistency rules clear and enforceable via ESLint
- Query key factories, error codes, and store patterns provided

**Structure Completeness:**
- Complete monorepo directory tree defined
- All 4 apps structured with feature-first organization
- Shared packages specified with clear boundaries
- Supabase migrations and functions organized by domain

**Pattern Completeness:**
- All naming conventions documented (database, API, code)
- Test colocation pattern established
- API response format standardized
- Error handling patterns with typed error codes
- Real-time channel naming conventions defined

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps (addressable during implementation):**
- Specific Drizzle schema definitions (will be created in first implementation story)
- Detailed RLS policy definitions (will follow schema creation)
- CI/CD workflow YAML files (will be created during pipeline setup)

**Nice-to-Have Enhancements:**
- Performance monitoring dashboard configuration
- Automated accessibility testing integration
- Load testing scripts for scalability validation

### Validation Issues Addressed

No blocking issues found. The architecture is coherent, complete, and ready for AI agent implementation.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (87 FRs, 9 categories)
- [x] Scale and complexity assessed (HIGH complexity, multi-app)
- [x] Technical constraints identified (HIPAA, NEMT compliance)
- [x] Cross-cutting concerns mapped (auth, logging, offline, real-time)

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (Clerk, Stripe, Twilio, Maps)
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined (feature-first)
- [x] Communication patterns specified (Realtime channels, Query keys)
- [x] Process patterns documented (error handling, loading states)

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH based on validation results

**Key Strengths:**
- Pre-selected, verified technology stack reduces decision risk
- Comprehensive state management strategy (TanStack Query + Zustand)
- Strong compliance foundation (HIPAA, NEMT)
- Monorepo enables efficient code sharing and coordinated deploys
- Hybrid API pattern balances simplicity with business logic encapsulation

**Areas for Future Enhancement:**
- Multi-region deployment (post-MVP scalability)
- Advanced caching strategies (performance optimization)
- Analytics platform selection (usage insights)
- Automated accessibility auditing (continuous compliance)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
# 1. Initialize Turborepo monorepo
npx create-turbo@latest veterans-first

# 2. Initialize mobile apps
npx create-expo-stack@latest rider-app --expo-router --nativewind --npm
npx create-expo-stack@latest driver-app --expo-router --nativewind --npm

# 3. Initialize web apps
npx create-next-app@latest admin-console --ts --tailwind --eslint --app --src-dir --use-npm
npx create-next-app@latest business-ops --ts --tailwind --eslint --app --src-dir --use-npm

# 4. Set up shared packages and Supabase project
```

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED
**Total Steps Completed:** 8
**Date Completed:** 2025-12-06
**Document Location:** docs/architecture.md

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**
- 15+ architectural decisions made
- 5 pattern categories defined (naming, structure, format, communication, process)
- 4 application components specified (rider, driver, admin, business)
- 87 functional requirements fully supported

**AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing veterans-first-app. Follow all decisions, patterns, and structures exactly as documented.

**Development Sequence:**
1. Initialize project using documented starter templates
2. Set up development environment per architecture
3. Implement Supabase schema with Drizzle ORM
4. Configure Clerk + Supabase JWT integration
5. Build features following established patterns
6. Maintain consistency with documented rules

### Quality Assurance Checklist

**Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**Requirements Coverage**
- [x] All 87 functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**Solid Foundation**
The chosen starter templates and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

