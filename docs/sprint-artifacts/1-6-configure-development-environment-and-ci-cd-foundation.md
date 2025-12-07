# Story 1.6: Configure Development Environment and CI/CD Foundation

Status: done

## Story

As a developer,
I want consistent development tooling and automated quality checks,
So that the team can collaborate effectively with high code quality.

## Acceptance Criteria

1. **Given** a developer clones the repository, **When** they run `npm install`, **Then** all dependencies are installed across the monorepo

2. **And** the following scripts work:
   - `npm run dev` - Starts all apps in development mode
   - `npm run build` - Builds all apps
   - `npm run lint` - Lints all apps and packages
   - `npm run test` - Runs all tests
   - `npm run typecheck` - Type checks all packages
   - `npm run db:generate` - Generates Drizzle migrations
   - `npm run db:push` - Applies migrations to database

3. **And** ESLint is configured with:
   - TypeScript support
   - React/React Native rules
   - Import sorting (eslint-plugin-import)
   - Accessibility rules (eslint-plugin-jsx-a11y)

4. **And** Prettier is configured for consistent formatting

5. **And** Husky pre-commit hooks run:
   - Lint-staged for changed files
   - Type checking

6. **And** GitHub Actions CI pipeline:
   - Triggers on PR to main
   - Runs lint, type check, and tests
   - Fails if any check fails

## Tasks / Subtasks

- [x] Task 1: Enhance ESLint Configuration (AC: #3)
  - [x] Add eslint-plugin-import for import sorting rules
  - [x] Add eslint-plugin-jsx-a11y for accessibility rules
  - [x] Update packages/config/eslint/index.js with new rules
  - [x] Ensure configuration works with ESLint 9 flat config format
  - [x] Test lint passes on existing codebase

- [x] Task 2: Verify Prettier Configuration (AC: #4)
  - [x] Confirm packages/config/prettier/index.js is complete
  - [x] Ensure .prettierrc or prettier config reference exists at root
  - [x] Run format:check to verify formatting works

- [x] Task 3: Add Typecheck Script to Turbo (AC: #2)
  - [x] Add `typecheck` task to turbo.json
  - [x] Add `typecheck` script to root package.json
  - [x] Ensure packages/shared has typecheck script (already exists)
  - [x] Test typecheck passes on existing codebase

- [x] Task 4: Configure Husky and lint-staged (AC: #5)
  - [x] Install husky and lint-staged as devDependencies
  - [x] Run `npx husky init` to initialize husky
  - [x] Create .husky/pre-commit hook
  - [x] Configure lint-staged in package.json or .lintstagedrc
  - [x] Hook runs: lint-staged for changed files, then typecheck
  - [x] Test pre-commit hook works on a test commit

- [x] Task 5: Create GitHub Actions CI Workflow (AC: #6)
  - [x] Create .github/workflows/ci.yml
  - [x] Configure trigger on PR to main branch
  - [x] Add job steps: checkout, setup Node 20, npm install
  - [x] Add parallel jobs for: lint, typecheck, test, build
  - [x] Configure Supabase CLI for database tests
  - [x] Set required secrets/env vars in workflow
  - [x] Test workflow passes (may need manual trigger first)

- [x] Task 6: Verify All Root Scripts Work (AC: #1, #2)
  - [x] Test `npm install` installs all workspace dependencies
  - [x] Test `npm run lint` runs across all packages
  - [x] Test `npm run typecheck` runs across all packages
  - [x] Test `npm run test` runs across all packages
  - [x] Test `npm run build` builds all packages (requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env var)
  - [x] Document any issues or fixes in dev notes

## Dev Notes

### Critical Architecture Requirements

This story completes Epic 1's technical foundation by establishing developer experience and automated quality checks. References:

- [Source: docs/architecture.md#Infrastructure-Deployment] - CI/CD: GitHub Actions → EAS (mobile) + Vercel (web)
- [Source: docs/architecture.md#Enforcement-Guidelines] - Linting/Formatting: ESLint + Prettier, Husky pre-commit hooks
- [Source: docs/epics.md#Story-1.6] - Full acceptance criteria

### Technical Stack (MUST USE)

| Dependency             | Version | Purpose                       |
| ---------------------- | ------- | ----------------------------- |
| ESLint                 | ^9.x    | Linting with flat config      |
| Prettier               | ^3.4.x  | Code formatting               |
| Husky                  | ^9.x    | Git hooks                     |
| lint-staged            | ^16.x   | Run linters on staged files   |
| @typescript-eslint/\*  | ^8.x    | TypeScript ESLint support     |
| eslint-plugin-import   | ^2.x    | Import sorting and validation |
| eslint-plugin-jsx-a11y | ^6.x    | Accessibility linting         |

### What Already Exists (DO NOT RECREATE)

**From Story 1.1 - packages/config/:**

```
packages/config/
├── package.json
├── eslint/index.js      # Base ESLint flat config (TypeScript only)
├── prettier/index.js    # Prettier config
└── typescript/
    ├── base.json
    ├── nextjs.json
    └── react-native.json
```

**Current ESLint config (packages/config/eslint/index.js):**

- Uses ESLint 9 flat config format
- Has @typescript-eslint/eslint-plugin and parser
- Missing: import sorting, jsx-a11y accessibility rules

**Root package.json scripts (already working):**

- `build`, `dev`, `lint`, `test`, `format`, `format:check`
- `db:generate`, `db:push`

**Missing scripts:**

- `typecheck` - needs to be added

**turbo.json tasks defined:**

- build, dev, lint, test, db:generate, db:push
- Missing: `typecheck` task

### ESLint Enhancement Requirements

**Add to packages/config/eslint/index.js:**

```javascript
// Add imports
const importPlugin = require("eslint-plugin-import");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");

// Add to baseConfig array:
{
  plugins: {
    "import": importPlugin,
    "jsx-a11y": jsxA11yPlugin,
  },
  rules: {
    // Import sorting
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }],
    "import/no-duplicates": "error",

    // Accessibility
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
  }
}
```

### Husky + lint-staged Configuration

**Install commands:**

```bash
npm install -D husky lint-staged
npx husky init
```

**Root package.json addition:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

**.husky/pre-commit:**

```bash
#!/bin/sh
npx lint-staged
npm run typecheck
```

### GitHub Actions CI Workflow

**Create .github/workflows/ci.yml:**

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: npm ci
      - run: supabase start
      - run: npm run test
      - run: supabase test db

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

### Turbo.json Updates

**Add typecheck task:**

```json
{
  "tasks": {
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
```

### File Structure Requirements

```
.github/
└── workflows/
    └── ci.yml                    # NEW: CI pipeline

.husky/
├── _/                            # NEW: Husky internals
└── pre-commit                    # NEW: Pre-commit hook

packages/config/
└── eslint/
    └── index.js                  # MODIFY: Add import + a11y plugins

package.json                      # MODIFY: Add lint-staged, typecheck script
turbo.json                        # MODIFY: Add typecheck task
```

### Previous Story Intelligence (Story 1.5)

**Key Learnings:**

- Vitest is configured in packages/shared for TypeScript tests
- SQL tests exist in supabase/tests/ and run with `supabase test db`
- Drizzle migrations are in supabase/migrations/
- Test scripts: `npm run test` runs vitest, `supabase test db` runs SQL tests

**Current test infrastructure:**

- packages/shared/vitest.config.ts exists
- packages/shared has `test` and `test:watch` scripts
- supabase/tests/\*.test.sql for database tests

### Git Intelligence (Recent Commits)

```
e687c36 feat(audit): implement audit logging triggers for HIPAA compliance (Story 1.5)
3a430a1 feat(rbac): implement role-based access control with RLS policies (Story 1.4)
ee796be feat(auth): implement Clerk authentication integration (Story 1.3)
51da6ce feat(shared): configure Supabase database schema foundation (Story 1.2)
```

**Commit pattern:** Use conventional commits - `feat(dx): configure development environment and CI/CD (Story 1.6)`

### Potential Blockers

1. **ESLint Plugin Compatibility** - Ensure import and jsx-a11y plugins work with ESLint 9 flat config. May need `eslint-plugin-import` with `@eslint/compat` for flat config support
2. **Husky Git Hooks** - Ensure .git directory is at repository root, not in subdirectory
3. **CI Secrets** - GitHub Actions needs SUPABASE_ACCESS_TOKEN and SUPABASE_DB_PASSWORD secrets configured
4. **Supabase CLI in CI** - Test job needs Supabase CLI and local Supabase instance

### Security Considerations

- Do NOT commit secrets to .github/workflows - use GitHub secrets
- Husky hooks should not bypass linting (avoid --no-verify in workflows)
- CI should run on all PRs to main to prevent untested code

### Testing Requirements

**Manual verification needed:**

1. Clone fresh repo, run `npm install` - all deps installed
2. Run `npm run lint` - no errors on clean code
3. Run `npm run typecheck` - no type errors
4. Run `npm run test` - all tests pass
5. Run `npm run build` - builds successfully
6. Make a commit - pre-commit hook runs lint-staged and typecheck
7. Open PR to main - CI workflow triggers and passes

### Anti-Patterns to Avoid

- **DO NOT** create separate ESLint configs per package - use shared config from packages/config
- **DO NOT** skip typecheck in pre-commit - it catches errors before they reach CI
- **DO NOT** use `--no-verify` in git commands - bypasses quality checks
- **DO NOT** hardcode secrets in workflow files - use GitHub secrets
- **DO NOT** run all CI jobs sequentially - parallelize lint, typecheck, test, build

### References

- [Source: docs/architecture.md#Infrastructure-Deployment] - CI/CD strategy
- [Source: docs/architecture.md#Enforcement-Guidelines] - ESLint + Prettier + Husky
- [Source: docs/epics.md#Story-1.6] - Acceptance criteria
- [ESLint Flat Config Migration](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [eslint-plugin-import Flat Config](https://github.com/import-js/eslint-plugin-import/issues/2556)

## Dev Agent Record

### Context Reference

- docs/architecture.md (Infrastructure & Deployment, Enforcement Guidelines)
- docs/epics.md (Epic 1, Story 1.6)
- docs/sprint-artifacts/1-5-implement-audit-logging-infrastructure.md (Previous story)
- packages/config/eslint/index.js (Current ESLint config)
- packages/config/prettier/index.js (Current Prettier config)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **ESLint Plugin Compatibility**: Refactored `packages/config/eslint/index.js` to export multiple configuration variants (`baseConfig`, `importRulesOnly`, `a11yRulesOnly`, `fullConfig`) to resolve conflicts with ESLint 9 flat config and framework-specific configs (Expo, Next.js).

2. **Expo Apps (rider, driver)**: Use `eslint-config-expo` which already includes `eslint-plugin-import`. Added `jsx-a11y` plugin explicitly since expo-config doesn't include it.

3. **Next.js Apps (admin, business)**: Use single import with named exports to avoid duplicate import errors.

4. **Clerk API Fix**: Fixed pre-existing TypeScript errors in authentication code. Changed `phoneNumber` to `identifier` parameter for `signIn.create()` and fixed type predicates for phone code factor detection.

5. **Build Environment**: Next.js apps require `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable for builds. CI workflow updated with Clerk secrets. Local builds work when env vars are provided.

6. **GitHub Secrets Required for CI**:
   - `SUPABASE_ACCESS_TOKEN` - For Supabase CLI
   - `SUPABASE_DB_PASSWORD` - For database tests
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - For Next.js builds
   - `CLERK_SECRET_KEY` - For Next.js builds
   - `NEXT_PUBLIC_SUPABASE_URL` - For Next.js builds
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For Next.js builds

### Verified Script Results

| Script              | Status  | Notes                                           |
| ------------------- | ------- | ----------------------------------------------- |
| `npm run lint`      | ✅ Pass | 5 packages, warnings only                       |
| `npm run typecheck` | ✅ Pass | 5 packages                                      |
| `npm run test`      | ✅ Pass | 35 tests in shared, placeholder scripts in apps |
| `npm run build`     | ✅ Pass | Requires Clerk env vars for Next.js apps        |

### File List

**Modified:**

- `packages/config/eslint/index.js` - Refactored for multi-config export
- `packages/config/package.json` - Added eslint-plugin-import, eslint-plugin-jsx-a11y
- `apps/rider/eslint.config.js` - Updated for new config exports
- `apps/driver/eslint.config.js` - Updated for new config exports
- `apps/admin/eslint.config.mjs` - Updated for new config exports
- `apps/business/eslint.config.mjs` - Updated for new config exports
- `packages/shared/eslint.config.mjs` - Updated to use fullConfig
- `turbo.json` - Added typecheck task
- `package.json` (root) - Added typecheck script, lint-staged config (prettier only), husky
- `package-lock.json` - Updated with new devDependencies
- `apps/rider/package.json` - Added typecheck script
- `apps/driver/package.json` - Added typecheck script
- `apps/admin/package.json` - Added typecheck script
- `apps/business/package.json` - Added typecheck script
- `apps/rider/app/(auth)/sign-in.tsx` - Fixed Clerk API usage
- `apps/rider/app/(auth)/verify.tsx` - Fixed Clerk API and ref callback
- `apps/driver/app/(auth)/sign-in.tsx` - Fixed Clerk API usage
- `apps/driver/app/(auth)/verify.tsx` - Fixed Clerk API and ref callback

**Created:**

- `.github/workflows/ci.yml` - GitHub Actions CI pipeline
- `.husky/pre-commit` - Pre-commit hook
- `prettier.config.js` (root) - Prettier config reference

## Change Log

| Date       | Change                                                                                                                                          | Author                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 2025-12-07 | Story created with comprehensive developer context                                                                                              | Create-Story Workflow |
| 2025-12-07 | Implemented all tasks: ESLint config, Prettier, typecheck, Husky, CI/CD, verified scripts                                                       | Claude Opus 4.5       |
| 2025-12-07 | Code review fixes: Added Supabase env vars to CI build, updated File List (lint-staged uses prettier only since lint runs separately via turbo) | Claude Opus 4.5       |
