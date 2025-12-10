# Story 1.2: Configure Supabase Project and Database Schema Foundation

Status: Done

## Story

As a developer,
I want Supabase configured with the foundational database schema,
So that all apps can interact with a properly structured database.

## Acceptance Criteria

1. **Given** the monorepo is initialized, **When** Supabase is configured, **Then** the following exists:
   - Supabase project created (or local development setup with `supabase init`)
   - `supabase/config.toml` configured for project
   - Connection to Supabase from all apps works

2. **And** the following core tables are created via Drizzle migrations:

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

3. **And** Drizzle ORM is configured:
   - `packages/shared/src/db/schema.ts` with table definitions
   - `drizzle.config.ts` at monorepo root
   - Migration generation works with `npm run db:generate`
   - Migration push works with `npm run db:push`

4. **And** TypeScript types are generated from schema

## Tasks / Subtasks

- [x] Task 1: Install Drizzle ORM Dependencies (AC: #3)
  - [x] Install `drizzle-orm` and `postgres` in `packages/shared`
  - [x] Install `drizzle-kit` as dev dependency in `packages/shared`
  - [x] Install `dotenv` for environment variable loading
  - [x] Verify workspace dependencies resolve correctly

- [x] Task 2: Create Drizzle Schema Definitions (AC: #2, #4)
  - [x] Create `packages/shared/src/db/` directory
  - [x] Create `packages/shared/src/db/schema.ts` with users and audit_logs tables
  - [x] Use `pgTable` from `drizzle-orm/pg-core` for table definitions
  - [x] Use `uuid`, `text`, `timestamptz`, `jsonb` column types
  - [x] Add CHECK constraint for role enum validation
  - [x] Export inferred TypeScript types using `InferSelectModel` and `InferInsertModel`

- [x] Task 3: Configure Drizzle Kit (AC: #3)
  - [x] Create `drizzle.config.ts` at monorepo root
  - [x] Configure schema path: `./packages/shared/src/db/schema.ts`
  - [x] Configure output directory: `./supabase/migrations`
  - [x] Configure dialect: `postgresql`
  - [x] Configure dbCredentials with `DATABASE_URL` from env
  - [x] Add `db:generate` and `db:push` scripts to root package.json

- [x] Task 4: Create Supabase Client Configuration (AC: #1)
  - [x] Create `packages/shared/src/db/client.ts` for database connection
  - [x] Use `postgres` driver with `prepare: false` for Supabase Transaction pooling
  - [x] Export drizzle client instance
  - [x] Handle connection string from environment variables
  - [x] Export from `packages/shared/src/db/index.ts` barrel file

- [x] Task 5: Update Environment Configuration (AC: #1)
  - [x] Add `DATABASE_URL` to `.env.example` with format hint
  - [x] Document connection string format for Supabase (pooler vs direct)
  - [x] Ensure Turborepo env inheritance passes DATABASE_URL to packages

- [x] Task 6: Generate and Apply Initial Migration (AC: #2, #3)
  - [x] Run `npm run db:generate` to create migration files
  - [x] Verify migration file created in `supabase/migrations/`
  - [x] Run `npm run db:push` or `supabase db push` to apply migration
  - [x] Verify tables exist in Supabase (migration pushed successfully)

- [x] Task 7: Export Types and Verify Integration (AC: #4)
  - [x] Update `packages/shared/src/types/index.ts` to re-export DB types
  - [x] Update `packages/shared/src/index.ts` to export db module
  - [x] Verify TypeScript types work in all apps (import test)
  - [x] Build packages/shared to verify no type errors

## Dev Notes

### Architecture Requirements

This story implements the database foundation defined in `docs/architecture.md`:

**Schema Management Decision (from Architecture):**

- Use **Drizzle ORM** for type-safe, lightweight schema management
- Drizzle Kit + Supabase CLI for migrations
- Drizzle inference + `supabase gen types` for TypeScript types

**API Layer Pattern:**
| Direct Supabase Client (RLS) | Supabase Edge Functions |
| --- | --- |
| Read rides, profiles | Book ride (complex transaction) |
| Real-time subscriptions | Process payment |

### Technical Stack Requirements

| Dependency  | Version | Purpose                       |
| ----------- | ------- | ----------------------------- |
| drizzle-orm | ^0.38.x | ORM for type-safe queries     |
| drizzle-kit | ^0.30.x | Migration generation CLI      |
| postgres    | ^3.4.x  | PostgreSQL driver for Node.js |
| dotenv      | ^16.x   | Environment variable loading  |

### Drizzle Schema Pattern (MUST FOLLOW)

```typescript
// packages/shared/src/db/schema.ts
import { pgTable, uuid, text, timestamptz, jsonb, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Role enum as CHECK constraint (Architecture pattern)
const roleCheck = check(
  "role_check",
  sql`role IN ('rider', 'driver', 'family', 'dispatcher', 'admin')`
);

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
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [roleCheck]
);

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
  createdAt: timestamptz("created_at").defaultNow(),
});

// Type exports (Architecture requirement)
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
```

### Drizzle Kit Configuration (MUST FOLLOW)

```typescript
// drizzle.config.ts (monorepo root)
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./packages/shared/src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Database Client Pattern (CRITICAL)

```typescript
// packages/shared/src/db/client.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// CRITICAL: Disable prefetch for Supabase Transaction pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

### Environment Variables (Add to .env.example)

```bash
# Supabase Database
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
# Use Transaction pooler (port 6543) for serverless, Direct (port 5432) for migrations
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# For migrations only (direct connection)
DATABASE_URL_DIRECT=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### FR Coverage

| FR   | Description                                                               | Implementation                                                                |
| ---- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| FR54 | System logs all access to rider personal and medical information          | `audit_logs` table with `resource_type`, `action`, `old_values`, `new_values` |
| FR55 | System maintains audit trail of all ride modifications and status changes | `audit_logs` table captures all changes with user attribution                 |

### Naming Conventions (Architecture)

- **Database columns:** snake_case (`first_name`, `created_at`)
- **TypeScript properties:** camelCase (Drizzle handles mapping automatically)
- **Table names:** snake_case plural (`users`, `audit_logs`)

### Audit Log Requirements (HIPAA Compliance)

- `audit_logs` table is **append-only** (no UPDATE or DELETE operations)
- All PHI access must be logged with `user_id`, `action`, `resource_type`
- Store `old_values` and `new_values` as JSONB for change tracking
- Capture `ip_address` and `user_agent` for security auditing

### Previous Story Intelligence

**From Story 1.1 (Initialize Monorepo Structure):**

- Monorepo structure is complete with `apps/`, `packages/`, `supabase/` directories
- `packages/shared` exists with `src/types/`, `src/api/`, `src/utils/`, `src/hooks/`
- Supabase initialized with `config.toml`, `migrations/`, `functions/` directories
- npm workspace configured with `@veterans-first/shared` package name
- Root `package.json` already has `db:generate` and `db:push` script placeholders
- Node 20 LTS configured in `.nvmrc`

**Files created in 1.1 that this story builds upon:**

- `supabase/config.toml` - Supabase local dev config
- `supabase/migrations/` - Empty directory for Drizzle migrations
- `packages/shared/src/types/index.ts` - Existing types (User, Ride interfaces)
- `.env.example` - Environment template (add DATABASE_URL here)

### File Structure Requirements

```
packages/shared/
├── src/
│   ├── db/                    # NEW: Database layer
│   │   ├── index.ts           # Barrel export
│   │   ├── schema.ts          # Drizzle table definitions
│   │   └── client.ts          # Database connection
│   ├── types/
│   │   └── index.ts           # UPDATE: Re-export DB types
│   └── index.ts               # UPDATE: Export db module

drizzle.config.ts              # NEW: At monorepo root

supabase/
├── migrations/
│   └── 0001_create_foundation.sql  # GENERATED: By drizzle-kit
```

### Testing Requirements

- Verify `npm run db:generate` creates migration file
- Verify `npm run db:push` applies migration without errors
- Verify TypeScript types import correctly in apps
- Verify `packages/shared` builds without errors
- Test database connection from a simple script

### Potential Blockers

1. **Supabase project not created** - Need active Supabase project for DATABASE_URL
2. **Connection pooler mode** - Must use `prepare: false` with Transaction pooler
3. **Migration conflicts** - If schema changes conflict with existing tables
4. **TypeScript version** - Drizzle requires TypeScript 5.x

### References

- [Source: docs/architecture.md#Data-Access-Patterns] - Drizzle ORM decision
- [Source: docs/architecture.md#Security-Authentication-Authorization] - Audit logging requirements
- [Source: docs/architecture.md#Implementation-Patterns] - Naming conventions
- [Source: docs/epics.md#Story-1.2] - Acceptance criteria and SQL schema
- [Source: docs/prd.md#FR54-FR55] - Compliance requirements
- [Drizzle ORM PostgreSQL Setup](https://orm.drizzle.team/docs/get-started/postgresql-new) - Official docs
- [Supabase + Drizzle Guide](https://supabase.com/docs/guides/database/drizzle) - Supabase integration

## Dev Agent Record

### Context Reference

- docs/architecture.md (Data Access Patterns, Security sections)
- docs/prd.md (FR54, FR55 - Compliance requirements)
- docs/epics.md (Epic 1, Story 1.2)
- docs/sprint-artifacts/1-1-initialize-monorepo-structure.md (Previous story learnings)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial db:push failed with DNS resolution error for placeholder DATABASE_URL
- Fixed after user configured valid Supabase project credentials

### Completion Notes List

- Installed Drizzle ORM dependencies (drizzle-orm, postgres, dotenv, drizzle-kit)
- Created database schema with users and audit_logs tables following architecture patterns
- Configured Drizzle Kit at monorepo root for migration management
- Created database client with `prepare: false` for Supabase Transaction pooling
- Added DATABASE_URL to .env.example with format documentation
- Generated initial migration (0000_friendly_mauler.sql) with correct schema
- Pushed migration to Supabase - tables created successfully
- Exported DB types and client via @veterans-first/shared package
- All lint and build checks pass

### Code Review Fixes Applied (2025-12-06)

**HIGH severity fixes:**

1. **Fixed eager DB connection on import** - Removed `export * from "./db"` from main barrel (`packages/shared/src/index.ts`). DB types are now available via `./types` re-export, and apps must explicitly import `@veterans-first/shared/db` to get the client. This prevents apps from crashing when importing just types/utils without DATABASE_URL set.

2. **Fixed migration config using wrong connection** - Updated `drizzle.config.ts` to prefer `DATABASE_URL_DIRECT` (direct connection, port 5432) over `DATABASE_URL` (transaction pooler, port 6543). Transaction pooler doesn't support prepared statements needed for DDL operations.

**MEDIUM severity fixes:** 3. **Added DATABASE_URL validation** - `drizzle.config.ts` now throws a helpful error message if neither DATABASE_URL_DIRECT nor DATABASE_URL is set.

4. **Documented DATABASE_URL_DIRECT** - Updated `.env.example` with proper format hint for direct connection string.

5. **Added database schema tests** - Created `packages/shared/src/db/__tests__/schema.test.ts` with type verification tests and manual connection test documentation.

### File List

**New Files:**

- packages/shared/src/db/schema.ts - Drizzle table definitions (users, audit_logs)
- packages/shared/src/db/client.ts - Database connection with Supabase pooler support
- packages/shared/src/db/index.ts - Barrel export for db module
- packages/shared/src/db/**tests**/schema.test.ts - Schema type verification tests (added in review)
- drizzle.config.ts - Drizzle Kit configuration at monorepo root
- supabase/migrations/0000_friendly_mauler.sql - Initial migration (auto-generated)
- supabase/migrations/meta/\_journal.json - Migration journal
- supabase/migrations/meta/0000_snapshot.json - Schema snapshot

**Modified Files:**

- packages/shared/package.json - Added drizzle-orm, postgres, dotenv, drizzle-kit dependencies; added ./db export
- packages/shared/src/index.ts - Removed db barrel export to prevent eager connection (fixed in review)
- packages/shared/src/types/index.ts - Re-export DB types (User, NewUser, AuditLog, NewAuditLog)
- packages/shared/tsup.config.ts - Added db/index entry point
- packages/shared/eslint.config.mjs - Added process global
- package.json - Updated db:generate and db:push scripts; added drizzle-kit, dotenv devDeps
- drizzle.config.ts - Added DATABASE_URL_DIRECT support and validation (fixed in review)
- .env.example - Added DATABASE_URL and DATABASE_URL_DIRECT with full documentation (enhanced in review)
- turbo.json - Added DATABASE_URL to globalEnv
