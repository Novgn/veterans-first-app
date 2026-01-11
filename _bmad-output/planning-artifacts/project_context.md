---
project_name: "veterans-first-app"
user_name: "Wayne"
date: "2025-12-06"
sections_completed:
  [
    "technology_stack",
    "language_rules",
    "framework_rules",
    "testing_rules",
    "code_quality",
    "workflow_rules",
    "critical_rules",
  ]
status: "complete"
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Category        | Technology               | Version | Notes                         |
| --------------- | ------------------------ | ------- | ----------------------------- |
| Mobile          | React Native Expo        | SDK 54+ | Use `npx create-expo-stack`   |
| Mobile Routing  | Expo Router              | Latest  | File-based routing            |
| Mobile Styling  | NativeWind               | Latest  | Tailwind for React Native     |
| Web             | Next.js                  | 15+     | App Router only               |
| Web Styling     | Tailwind CSS + shadcn/ui | Latest  | Use `npx shadcn@latest`       |
| Auth            | Clerk                    | Latest  | Phone-first, JWT to Supabase  |
| Database        | Supabase                 | Latest  | PostgreSQL + Realtime + RLS   |
| ORM             | Drizzle                  | Latest  | Type-safe, SQL-like           |
| Server State    | TanStack Query           | v5      | With AsyncStorage persistence |
| Client State    | Zustand                  | v4      | With AsyncStorage persistence |
| Monorepo        | Turborepo                | Latest  | npm workspaces                |
| Package Manager | npm                      | -       | NOT bun, NOT yarn             |

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- ALWAYS use strict TypeScript (`"strict": true`)
- NEVER use `any` - use `unknown` with type guards instead
- Use Drizzle-inferred types for database entities
- Import types with `import type { Foo }` syntax
- Prefer `async/await` over raw Promises
- Use `satisfies` operator for type-safe object literals

### Framework-Specific Rules

**Expo/React Native:**

- Use Expo Router for all navigation (file-based in `/app`)
- Use NativeWind classes, NOT StyleSheet.create()
- Store offline data in AsyncStorage via Zustand persist
- Use `expo-secure-store` for sensitive tokens

**Next.js:**

- Use App Router only (NOT Pages Router)
- Server Components by default, `"use client"` only when needed
- Use Route Handlers (`/app/api/`) for API endpoints
- Clerk middleware in `src/middleware.ts`

**State Management:**

- TanStack Query for ALL server state (API data)
- Zustand for ALL client state (UI, preferences, offline queue)
- Use query key factory pattern:
  ```typescript
  export const rideKeys = {
    all: ["rides"] as const,
    lists: () => [...rideKeys.all, "list"] as const,
    list: (filters: RideFilters) => [...rideKeys.lists(), filters] as const,
    detail: (id: string) => [...rideKeys.all, "detail", id] as const,
  };
  ```

### Testing Rules

- Co-locate tests: `Component.tsx` → `Component.test.tsx`
- Use React Testing Library for component tests
- Mock Supabase client in tests, NOT real database
- Test Edge Functions with Deno test runner
- Minimum coverage: 80% for business logic

### Code Quality & Style Rules

**File Naming:**

- Components: `PascalCase.tsx` (e.g., `RideCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useRides.ts`)
- Utils: `camelCase.ts` (e.g., `formatPrice.ts`)
- Tests: `*.test.ts` or `*.test.tsx`

**Database Naming:**

- Tables: `snake_case`, plural (`rides`, `driver_profiles`)
- Columns: `snake_case` (`user_id`, `created_at`)
- Indexes: `idx_{table}_{columns}` (`idx_rides_rider_id`)

**API Naming:**

- Endpoints: `kebab-case`, plural (`/api/driver-profiles`)
- Edge Functions: `kebab-case` (`book-ride`, `send-notification`)
- Response format: `{ data: T | null, error: AppError | null }`

### Development Workflow Rules

- Branch naming: `feature/`, `fix/`, `chore/` prefixes
- Commit format: Conventional Commits (`feat:`, `fix:`, `chore:`)
- Run `turbo lint` before committing
- All PRs require passing CI (lint + type-check + test)

### Critical Don't-Miss Rules

**NEVER:**

- Use `bun` or `yarn` - this project uses `npm` only
- Access Supabase directly for business logic - use Edge Functions
- Store PHI without encryption or audit logging
- Skip RLS policies - every table needs them
- Use inline styles in React Native - use NativeWind classes
- Create new state stores - use existing patterns

**ALWAYS:**

- Use typed error codes from `ErrorCode` union type
- Persist TanStack Query cache to AsyncStorage (mobile)
- Route complex transactions through Edge Functions
- Log PHI access to `audit_logs` table
- Use Clerk roles for authorization checks
- Handle offline state gracefully with Zustand queue

**Edge Cases:**

- Phone numbers: Always normalize to E.164 format
- Dates: Store as `timestamptz`, transmit as ISO 8601
- Money: Use integers (cents), NOT floats
- Coordinates: `{lat: number, lng: number}` format

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Reference `docs/architecture.md` for detailed patterns

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_Last Updated: 2025-12-06_
