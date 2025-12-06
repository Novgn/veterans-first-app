# Story 1.1: Initialize Monorepo Structure

Status: Ready for Review

## Story

As a developer,
I want a properly configured Turborepo monorepo with all apps and packages scaffolded,
So that I can begin building features with shared code and consistent tooling.

## Acceptance Criteria

1. **Given** a new project directory, **When** the monorepo is initialized, **Then** the following structure exists:
   - `apps/rider/` - Expo app scaffolded with create-expo-stack (expo-router, nativewind, npm)
   - `apps/driver/` - Expo app scaffolded with create-expo-stack (expo-router, nativewind, npm)
   - `apps/admin/` - Next.js app scaffolded with create-next-app (ts, tailwind, eslint, app, src-dir, npm)
   - `apps/business/` - Next.js app scaffolded with create-next-app (ts, tailwind, eslint, app, src-dir, npm)
   - `packages/shared/` - TypeScript package for shared types, utils, API client
   - `packages/config/` - ESLint, TypeScript, Prettier configurations
   - `supabase/` - Migrations and functions directories

2. **And** Turborepo is configured with:
   - `turbo.json` with build, dev, lint, test pipelines
   - Dependency graph properly configured
   - Environment variable inheritance

3. **And** all apps can run independently with `npm run dev`

4. **And** shared package is importable as `@veterans-first/shared`

## Tasks / Subtasks

- [x] Task 1: Initialize Turborepo monorepo (AC: #1, #2)
  - [x] Run `npx create-turbo@latest veterans-first` to scaffold base structure
  - [x] Configure `turbo.json` with build, dev, lint, test pipelines
  - [x] Set up environment variable inheritance in turbo.json
  - [x] Create `.env.example` with all required environment variables
  - [x] Configure `.nvmrc` with Node 20 LTS
  - [x] Configure `.npmrc` for workspace setup

- [x] Task 2: Initialize Mobile Apps with Create Expo Stack (AC: #1, #3)
  - [x] Create `apps/rider/` using `npx create-expo-stack@latest rider --expo-router --nativewind --npm`
  - [x] Create `apps/driver/` using `npx create-expo-stack@latest driver --expo-router --nativewind --npm`
  - [x] Update app.json for each with correct bundle identifiers (com.veteransfirst.rider, com.veteransfirst.driver)
  - [x] Configure NativeWind with design tokens matching UX spec (primary blue #1E40AF, warm white #FAFAF9, 18px base font)
  - [x] Verify both apps run with `npm run dev`

- [x] Task 3: Initialize Web Apps with Create Next App (AC: #1, #3)
  - [x] Create `apps/admin/` using `npx create-next-app@latest admin --ts --tailwind --eslint --app --src-dir --use-npm`
  - [x] Create `apps/business/` using `npx create-next-app@latest business --ts --tailwind --eslint --app --src-dir --use-npm`
  - [x] Add shadcn/ui to both apps using `npx shadcn@latest init`
  - [x] Configure Tailwind with design tokens matching UX spec
  - [x] Verify both apps run with `npm run dev`

- [x] Task 4: Create Shared Packages (AC: #1, #4)
  - [x] Create `packages/shared/` TypeScript package
  - [x] Configure package.json with name `@veterans-first/shared`
  - [x] Set up src/ directory with types/, api/, utils/, hooks/ folders
  - [x] Configure TypeScript with proper module resolution
  - [x] Export types and utilities from package index
  - [x] Verify import works from all apps

- [x] Task 5: Create Config Package (AC: #1)
  - [x] Create `packages/config/` package
  - [x] Add shared ESLint configuration (eslint/)
  - [x] Add shared TypeScript configuration (typescript/)
  - [x] Add shared Prettier configuration (prettier/)
  - [x] Configure all apps to extend these configs

- [x] Task 6: Create Supabase Structure (AC: #1)
  - [x] Create `supabase/` directory at monorepo root
  - [x] Initialize with `supabase init` to create config.toml
  - [x] Create `supabase/migrations/` directory
  - [x] Create `supabase/functions/` directory
  - [x] Create `supabase/seed.sql` placeholder

- [x] Task 7: Final Verification (AC: #2, #3, #4)
  - [x] Verify `npm run dev` starts all apps
  - [x] Verify `npm run build` builds all apps
  - [x] Verify `npm run lint` lints all apps
  - [x] Verify shared package imports work in all apps
  - [x] Verify Turborepo caching works correctly
  - [x] Document any setup issues or deviations

## Dev Notes

### Architecture Requirements

This story implements the monorepo structure defined in `docs/architecture.md`:

```
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
│   ├── ui/                       # Shared UI components (Phase 2)
│   └── config/                   # ESLint, TypeScript, Prettier
│
└── supabase/
    ├── config.toml
    ├── migrations/               # Drizzle migrations
    ├── functions/                # Edge Functions
    └── seed.sql
```

### Technical Stack (from Architecture)

| Layer | Technology | Version |
|-------|------------|---------|
| Mobile | React Native Expo | SDK 54+ |
| Mobile Styling | NativeWind | v4/v5 |
| Web | Next.js | 15+ |
| Web Styling | Tailwind CSS + shadcn/ui | Latest |
| Package Manager | npm | Latest |
| Monorepo | Turborepo | Latest |
| Node | Node.js | 20 LTS |

### Initialization Commands Reference

```bash
# Mobile Apps (Rider + Driver)
npx create-expo-stack@latest rider --expo-router --nativewind --npm
npx create-expo-stack@latest driver --expo-router --nativewind --npm

# Web Apps (Admin + Business)
npx create-next-app@latest admin --ts --tailwind --eslint --app --src-dir --use-npm
npx create-next-app@latest business --ts --tailwind --eslint --app --src-dir --use-npm

# Add shadcn/ui to web apps
cd apps/admin && npx shadcn@latest init
cd apps/business && npx shadcn@latest init
```

### UX Design Tokens (from UX Specification)

Configure Tailwind/NativeWind with these tokens:

**Colors:**
- Primary Blue: `#1E40AF` - CTAs, links, trust indicator
- Secondary Green: `#059669` - Success, wellness, positive actions
- Accent Gold: `#D97706` - Veteran honor, highlights
- Background Warm White: `#FAFAF9` - Easy on aging eyes
- Text Charcoal: `#1C1917` - High contrast, not harsh
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`

**Typography:**
- Font Family: System fonts (SF Pro iOS, Roboto Android)
- Base Size: 18px (larger than standard for senior readability)
- Scale: 1.25 modular scale
- Line Height: 1.6

**Spacing:**
- Base unit: 4px
- Touch targets: 48dp minimum, 56dp for primary actions

### turbo.json Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": {},
    "db:push": {}
  }
}
```

### Environment Variables Template (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Project Structure Notes

- All apps use `src/` directory for source code (feature-first organization)
- Mobile apps use `app/` for Expo Router file-based routing
- Web apps use `src/app/` for Next.js App Router
- Shared package exports via barrel files (index.ts)
- Config package provides extending configurations

### Key Dependencies to Install

**All Apps:**
- `@veterans-first/shared` (workspace dependency)

**Mobile Apps (after scaffold):**
- `@clerk/clerk-expo`
- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `@tanstack/react-query`
- `zustand`
- `@tanstack/query-async-storage-persister`
- `@tanstack/react-query-persist-client`

**Web Apps (after scaffold):**
- `@clerk/nextjs`
- `@supabase/supabase-js`
- `@tanstack/react-query`
- `zustand`

*Note: These dependencies are documented here for context but will be installed in subsequent stories (1.2, 1.3)*

### Potential Blockers

1. **Turborepo + Expo compatibility** - Ensure Turborepo caching doesn't conflict with Expo's Metro bundler
2. **NativeWind v4/v5** - Check latest stable version and compatibility with Expo SDK 54+
3. **shadcn/ui initialization** - May require interactive prompts; document any manual steps

### References

- [Source: docs/architecture.md#Monorepo-Structure] - Complete directory tree
- [Source: docs/architecture.md#Starter-Template-Evaluation] - Initialization commands
- [Source: docs/architecture.md#Implementation-Patterns] - Naming conventions
- [Source: docs/ux-design-specification.md#Design-System-Foundation] - Design tokens
- [Source: docs/prd.md#Technology-Stack] - Tech stack versions

## Dev Agent Record

### Context Reference

<!-- Comprehensive context from create-story workflow -->
- docs/architecture.md (full document)
- docs/prd.md (Technology Stack, Non-Functional Requirements)
- docs/ux-design-specification.md (Design System Foundation, Visual Design Foundation)
- docs/epics.md (Epic 1, Story 1.1)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- No blocking issues encountered

### Completion Notes List

- Successfully initialized Turborepo monorepo with npm workspaces
- Created 4 apps: rider (Expo), driver (Expo), admin (Next.js 16), business (Next.js 16)
- Mobile apps configured with NativeWind and UX design tokens (primary blue #1E40AF, warm white background #FAFAF9, 18px base font)
- Web apps configured with Tailwind v4, shadcn/ui, and custom CSS variables matching UX design tokens
- Created @veterans-first/shared package with types, API client, utils, and hooks
- Created @veterans-first/config package with ESLint, TypeScript, and Prettier configurations
- Initialized Supabase structure with config.toml, migrations/, functions/, and seed.sql
- All verification tasks passed: build (with caching), lint, shared package imports
- Turborepo caching confirmed working (FULL TURBO on repeat builds)

**Deviations/Notes:**
- Used Next.js 16.0.7 instead of 15+ (newer version, still compatible)
- Tailwind v4 uses new `@import "tailwindcss"` syntax instead of v3 directives
- Mobile apps created with Expo SDK 54 and React Native 0.81.4
- .github/workflows/ directory not created (CI/CD is separate infrastructure story)

### File List

**New Files:**
- package.json (root monorepo config)
- turbo.json (Turborepo pipelines)
- .env.example (environment variables template)
- .nvmrc (Node version specification)
- .npmrc (npm workspace config)
- .gitignore (updated for monorepo)
- apps/rider/* (Expo app - all scaffolded files)
- apps/driver/* (Expo app - all scaffolded files)
- apps/admin/* (Next.js app - all scaffolded files)
- apps/business/* (Next.js app - all scaffolded files)
- packages/shared/package.json
- packages/shared/tsconfig.json
- packages/shared/tsup.config.ts
- packages/shared/eslint.config.mjs
- packages/shared/src/index.ts
- packages/shared/src/types/index.ts
- packages/shared/src/api/index.ts
- packages/shared/src/api/client.ts
- packages/shared/src/utils/index.ts
- packages/shared/src/hooks/index.ts
- packages/config/package.json
- packages/config/eslint/index.js
- packages/config/typescript/base.json
- packages/config/typescript/nextjs.json
- packages/config/typescript/react-native.json
- packages/config/prettier/index.js
- supabase/config.toml
- supabase/seed.sql
- supabase/migrations/ (empty directory)
- supabase/functions/ (empty directory)

**Modified Files:**
- apps/rider/app.json (bundle identifier, splash colors)
- apps/rider/tailwind.config.js (UX design tokens)
- apps/rider/package.json (shared dependency, dev script)
- apps/driver/app.json (bundle identifier, splash colors)
- apps/driver/tailwind.config.js (UX design tokens)
- apps/driver/package.json (shared dependency, dev script)
- apps/admin/src/app/globals.css (Veterans First design tokens)
- apps/admin/package.json (shared dependency, turbopack)
- apps/business/src/app/globals.css (Veterans First design tokens)
- apps/business/package.json (shared dependency, turbopack)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-06 | Initial implementation - complete monorepo setup with all apps, packages, and Supabase structure | Claude Opus 4.5 |
