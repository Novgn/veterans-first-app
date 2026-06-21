# Mobile Maestro E2E Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exhaustive, reproducible on-device Maestro coverage of every `apps/mobile` screen, backed by a one-command seed that provisions matched Clerk + Supabase test users so authenticated flows are runnable by anyone.

**Architecture:** A two-sided idempotent TypeScript seed (`@clerk/backend` for auth users + `@supabase/supabase-js` service-role for data) creates one test user per role with `publicMetadata.role` and matching Supabase fixtures. Maestro flows live in per-surface folders under `apps/mobile/.maestro`, share reusable `subflows/`, and are run by tag against a simulator build. Screens with real user journeys get behavioral flows; orphan screens (edge states, legal) get deep-link render checks.

**Tech Stack:** Expo Router / React Native, Maestro (YAML flows), Clerk (`@clerk/backend`, `@clerk/clerk-expo`), Supabase (`@supabase/supabase-js@2.87`), `tsx` runner, GitHub Actions (opt-in).

## Global Constraints

- **No app behavior changes** beyond adding missing `testID`s. Edge-state triggers stay out of scope.
- **testID convention:** kebab-case string literals, matching existing usage, e.g. `testID="driver-status-toggle"`, `testID={\`trip-card-${id}\`}`.
- **App id:** `com.novagen.veteransfirst`. **Deep-link scheme:** `veterans-first://`.
- **Clerk dev test mode:** test phone numbers verify with the fixed code `424242`. Seed must fail loudly if test mode is off.
- **Secrets** (`CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) come from the local env / `.env`; never commit them.
- **Existing `supabase/seed.sql` is untouched** — it serves RLS unit tests with fake `clerk_id`s. This harness's seed is separate and additive.
- **Ride fixtures use core columns only** (`rider_id, driver_id, status, pickup_address, dropoff_address, scheduled_pickup_time`) with status in `('pending','assigned','in_progress','completed','cancelled')` to stay compatible with the base CHECK constraint.

---

## Prerequisites (environment — verify before Task 1)

The executor needs, on a macOS machine:

1. **Maestro** installed (`curl -Ls https://get.maestro.mobile.dev | bash`, JDK 11+, `~/.maestro/bin` on `PATH`).
2. **A booted simulator + native build:** `cd apps/mobile && xcrun simctl boot "iPhone 16 Pro" && npx expo run:ios`.
3. **Env vars** available to the seed: `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (or `EXPO_PUBLIC_SUPABASE_URL`).
4. **Clerk dev instance** with test mode enabled and the test-phone pattern `+1XXX555XXXX` allow-listed.

If any are missing, stop and surface it — the seed and flows cannot pass without them.

---

## File Structure

**Create:**

- `apps/mobile/scripts/e2e-seed.config.ts` — canonical test-user table (role → phone, names, fixtures).
- `apps/mobile/scripts/e2e-seed/clerk.ts` — Clerk find-or-create + role metadata.
- `apps/mobile/scripts/e2e-seed/supabase.ts` — Supabase upsert users + role fixtures.
- `apps/mobile/scripts/e2e-seed/index.ts` — orchestrator + `--teardown`.
- `apps/mobile/.maestro/config.yaml` — tag/flow config.
- `apps/mobile/.maestro/subflows/{sign-in-as-rider,sign-in-as-driver,sign-in-as-family,reset-app,deep-link}.yaml`
- `apps/mobile/.maestro/pre-auth/{welcome,sign-up,sign-in,verify}.yaml`
- `apps/mobile/.maestro/onboarding/{wizard,steps}.yaml`
- `apps/mobile/.maestro/rider/*.yaml`
- `apps/mobile/.maestro/driver/*.yaml`
- `apps/mobile/.maestro/family/*.yaml`
- `apps/mobile/.maestro/edge-and-legal/*.yaml`
- `.github/workflows/e2e-mobile.yml` — `workflow_dispatch`-only.

**Modify:**

- `apps/mobile/package.json` — add devDeps + `e2e:*` scripts.
- `apps/mobile/.maestro/README.md` — rewrite run guide.
- Screen files lacking a needed selector — add `testID` (per-flow, e.g. `app/(rider)/booking/index.tsx`).

**Replace/retire:**

- Existing `apps/mobile/.maestro/smoke-welcome.yaml` → folds into `pre-auth/welcome.yaml`.
- Existing `apps/mobile/.maestro/rider-tour.yaml` → superseded by `rider/*` flows; delete.

---

## Task 1: Seed dependencies, config, and test-user table

**Files:**

- Modify: `apps/mobile/package.json`
- Create: `apps/mobile/scripts/e2e-seed.config.ts`

**Interfaces:**

- Produces: `TEST_USERS: TestUser[]` where
  `TestUser = { key: 'rider'|'driver'|'family'|'suspended'; role: 'rider'|'driver'|'family'; phone: string; firstName: string; lastName: string; email: string; suspended?: boolean }`.

- [ ] **Step 1: Add dev dependencies**

Run:

```bash
cd apps/mobile && npm install -D @clerk/backend@^1 tsx@^4
```

Expected: both added to `devDependencies`.

- [ ] **Step 2: Create the test-user table**

Create `apps/mobile/scripts/e2e-seed.config.ts`:

```ts
export type Role = "rider" | "driver" | "family";

export interface TestUser {
  key: "rider" | "driver" | "family" | "suspended";
  role: Role;
  phone: string; // Clerk dev test phone → verifies with code 424242
  firstName: string;
  lastName: string;
  email: string;
  suspended?: boolean;
}

// Deterministic test phones in the dev test-mode allow-list pattern.
export const TEST_USERS: TestUser[] = [
  {
    key: "rider",
    role: "rider",
    phone: "+12015550100",
    firstName: "Test",
    lastName: "Rider",
    email: "e2e-rider@example.com",
  },
  {
    key: "driver",
    role: "driver",
    phone: "+12015550101",
    firstName: "Test",
    lastName: "Driver",
    email: "e2e-driver@example.com",
  },
  {
    key: "family",
    role: "family",
    phone: "+12015550102",
    firstName: "Test",
    lastName: "Family",
    email: "e2e-family@example.com",
  },
  {
    key: "suspended",
    role: "rider",
    phone: "+12015550103",
    firstName: "Test",
    lastName: "Suspended",
    email: "e2e-suspended@example.com",
    suspended: true,
  },
];

export const VERIFY_CODE = "424242";
```

- [ ] **Step 3: Verify it compiles**

Run: `cd apps/mobile && npx tsc --noEmit scripts/e2e-seed.config.ts`
Expected: no output (success).

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/package.json apps/mobile/package-lock.json apps/mobile/scripts/e2e-seed.config.ts
git commit -m "chore(mobile): add e2e seed deps + test-user table"
```

---

## Task 2: Seed — Clerk side (find-or-create users with roles)

**Files:**

- Create: `apps/mobile/scripts/e2e-seed/clerk.ts`

**Interfaces:**

- Consumes: `TEST_USERS`, `TestUser` from `../e2e-seed.config`.
- Produces: `seedClerkUsers(): Promise<Map<TestUser['key'], string>>` (key → real Clerk user id) and `teardownClerkUsers(): Promise<void>`.

- [ ] **Step 1: Implement the Clerk seeder**

Create `apps/mobile/scripts/e2e-seed/clerk.ts`:

```ts
import { createClerkClient } from "@clerk/backend";
import { TEST_USERS, type TestUser } from "../e2e-seed.config";

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) throw new Error("CLERK_SECRET_KEY is required for e2e seed");
const clerk = createClerkClient({ secretKey });

async function findByPhone(phone: string) {
  const res = await clerk.users.getUserList({ phoneNumber: [phone], limit: 1 });
  return res.data[0] ?? null;
}

export async function seedClerkUsers(): Promise<Map<TestUser["key"], string>> {
  const ids = new Map<TestUser["key"], string>();
  for (const u of TEST_USERS) {
    let user = await findByPhone(u.phone);
    if (!user) {
      user = await clerk.users.createUser({
        phoneNumber: [u.phone],
        firstName: u.firstName,
        lastName: u.lastName,
        emailAddress: [u.email],
        publicMetadata: { role: u.role, suspended: u.suspended ?? false },
        skipPasswordRequirement: true,
      });
    } else {
      user = await clerk.users.updateUser(user.id, {
        publicMetadata: { role: u.role, suspended: u.suspended ?? false },
      });
    }
    ids.set(u.key, user.id);
    console.log(`clerk ✓ ${u.key} (${u.role}) → ${user.id}`);
  }
  return ids;
}

export async function teardownClerkUsers(): Promise<void> {
  for (const u of TEST_USERS) {
    const user = await findByPhone(u.phone);
    if (user) {
      await clerk.users.deleteUser(user.id);
      console.log(`clerk ✗ deleted ${u.key} (${user.id})`);
    }
  }
}
```

- [ ] **Step 2: Smoke-run the Clerk seeder in isolation**

Run:

```bash
cd apps/mobile && npx tsx -e "import('./scripts/e2e-seed/clerk').then(m => m.seedClerkUsers())"
```

Expected: four `clerk ✓` lines printing real `user_…` ids. If you see a 422/test-mode error, **stop** — Clerk test mode is not enabled (see Prerequisites).

- [ ] **Step 3: Verify idempotency**

Run the same command again.
Expected: same four ids, no duplicate-user error (find-or-create path taken).

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/scripts/e2e-seed/clerk.ts
git commit -m "feat(mobile): e2e seed — Clerk test users with roles"
```

---

## Task 3: Seed — Supabase side + orchestrator + teardown

**Files:**

- Create: `apps/mobile/scripts/e2e-seed/supabase.ts`
- Create: `apps/mobile/scripts/e2e-seed/index.ts`

**Interfaces:**

- Consumes: `seedClerkUsers`, `teardownClerkUsers` (Task 2); `TEST_USERS` (Task 1).
- Produces: CLI `e2e-seed/index.ts` supporting `--teardown`. `seedSupabase(ids: Map<string,string>): Promise<void>`.

- [ ] **Step 1: Implement the Supabase seeder**

Create `apps/mobile/scripts/e2e-seed/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import { TEST_USERS, type TestUser } from "../e2e-seed.config";

const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function upsertUser(u: TestUser, clerkId: string): Promise<string> {
  const { data, error } = await db
    .from("users")
    .upsert(
      {
        clerk_id: clerkId,
        phone: u.phone,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        role: u.role,
      },
      { onConflict: "clerk_id" }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function seedSupabase(ids: Map<TestUser["key"], string>): Promise<void> {
  const dbId: Partial<Record<TestUser["key"], string>> = {};
  for (const u of TEST_USERS) {
    const clerkId = ids.get(u.key);
    if (!clerkId) throw new Error(`missing clerk id for ${u.key}`);
    dbId[u.key] = await upsertUser(u, clerkId);
    console.log(`supabase ✓ user ${u.key} → ${dbId[u.key]}`);
  }

  const riderId = dbId.rider!;
  const driverId = dbId.driver!;
  const familyId = dbId.family!;

  // Rider fixtures: saved places (home/work) + one upcoming + one past ride.
  await db.from("saved_destinations").upsert(
    [
      {
        user_id: riderId,
        label: "Home",
        address: "100 Main St",
        lat: 38.8951,
        lng: -77.0364,
        is_default_pickup: true,
      },
      {
        user_id: riderId,
        label: "VA Clinic",
        address: "50 Medical Center Dr",
        lat: 38.9,
        lng: -77.05,
        is_default_dropoff: true,
      },
    ],
    { onConflict: "user_id,label" }
  );

  await db.from("rides").delete().eq("rider_id", riderId); // reset to a known state
  await db.from("rides").insert([
    {
      rider_id: riderId,
      driver_id: driverId,
      status: "assigned",
      pickup_address: "100 Main St",
      dropoff_address: "50 Medical Center Dr",
      scheduled_pickup_time: "2026-12-01T15:00:00Z",
    },
    {
      rider_id: riderId,
      driver_id: driverId,
      status: "completed",
      pickup_address: "100 Main St",
      dropoff_address: "50 Medical Center Dr",
      scheduled_pickup_time: "2026-01-10T15:00:00Z",
    },
  ]);

  // Driver fixtures: profile + Mon/Wed availability.
  await db
    .from("driver_profiles")
    .upsert(
      {
        user_id: driverId,
        vehicle_make: "Toyota",
        vehicle_model: "Sienna",
        vehicle_year: "2022",
        vehicle_color: "Silver",
        vehicle_plate: "E2E-1234",
        is_active: true,
      },
      { onConflict: "user_id" }
    );
  await db.from("driver_availability").delete().eq("driver_id", driverId);
  await db.from("driver_availability").insert([
    {
      driver_id: driverId,
      day_of_week: 1,
      start_time: "08:00",
      end_time: "17:00",
      is_active: true,
    },
    {
      driver_id: driverId,
      day_of_week: 3,
      start_time: "08:00",
      end_time: "17:00",
      is_active: true,
    },
  ]);

  // Family fixture: approved link family → rider.
  await db
    .from("family_links")
    .upsert(
      { rider_id: riderId, family_member_id: familyId, status: "approved" },
      { onConflict: "rider_id,family_member_id" }
    );

  console.log("supabase ✓ fixtures complete");
}

export async function teardownSupabase(ids: Map<TestUser["key"], string>): Promise<void> {
  for (const u of TEST_USERS) {
    const clerkId = ids.get(u.key);
    if (clerkId) await db.from("users").delete().eq("clerk_id", clerkId); // FK cascade clears fixtures
  }
  console.log("supabase ✗ users + fixtures removed");
}
```

- [ ] **Step 2: Implement the orchestrator**

Create `apps/mobile/scripts/e2e-seed/index.ts`:

```ts
import { seedClerkUsers, teardownClerkUsers } from "./clerk";
import { seedSupabase, teardownSupabase } from "./supabase";

async function main() {
  const teardown = process.argv.includes("--teardown");
  const ids = await seedClerkUsers(); // resolves ids either way
  if (teardown) {
    await teardownSupabase(ids);
    await teardownClerkUsers();
    console.log("\nteardown complete");
    return;
  }
  await seedSupabase(ids);
  console.log("\nseed complete — sign in with the test phones (code 424242)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run the full seed**

Run: `cd apps/mobile && npx tsx scripts/e2e-seed/index.ts`
Expected: `clerk ✓` ×4, `supabase ✓` user lines + `fixtures complete`, then `seed complete`.

- [ ] **Step 4: Verify idempotency + data**

Run the seed again (expect no errors), then:

```bash
cd apps/mobile && npx tsx -e "import('@supabase/supabase-js').then(async ({createClient})=>{const d=createClient(process.env.SUPABASE_URL||process.env.EXPO_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);const u=await d.from('users').select('role').like('email','e2e-%@example.com');console.log('users',u.data?.length);})"
```

Expected: `users 4`.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/scripts/e2e-seed/supabase.ts apps/mobile/scripts/e2e-seed/index.ts
git commit -m "feat(mobile): e2e seed — Supabase users + role fixtures + teardown"
```

---

## Task 4: package.json run scripts

**Files:**

- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Add scripts**

Add to the `"scripts"` block:

```json
"e2e:seed": "tsx scripts/e2e-seed/index.ts",
"e2e:seed:teardown": "tsx scripts/e2e-seed/index.ts --teardown",
"e2e:ios": "maestro test .maestro",
"e2e:ios:tag": "maestro test --include-tags"
```

- [ ] **Step 2: Verify scripts resolve**

Run: `cd apps/mobile && npm run e2e:seed --silent` (re-seed; idempotent).
Expected: `seed complete`.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json
git commit -m "chore(mobile): add e2e run scripts"
```

---

## Task 5: Maestro config + reusable subflows

**Files:**

- Create: `apps/mobile/.maestro/config.yaml`
- Create: `apps/mobile/.maestro/subflows/{reset-app,deep-link,sign-in-as-rider,sign-in-as-driver,sign-in-as-family}.yaml`

**Interfaces:**

- Produces: subflows callable via `runFlow`; `sign-in-as-<role>` leaves the app on that role's landing screen. `deep-link` accepts `env: { LINK }`.

- [ ] **Step 1: Config**

Create `apps/mobile/.maestro/config.yaml`:

```yaml
# Maestro workspace config. Tags let you run one surface in isolation:
#   maestro test --include-tags rider .maestro
flows:
  - "**/*.yaml"
```

- [ ] **Step 2: reset-app subflow**

Create `apps/mobile/.maestro/subflows/reset-app.yaml`:

```yaml
appId: com.novagen.veteransfirst
---
- launchApp:
    clearState: true
```

- [ ] **Step 3: deep-link subflow**

Create `apps/mobile/.maestro/subflows/deep-link.yaml`:

```yaml
appId: com.novagen.veteransfirst
---
- openLink: ${LINK}
```

- [ ] **Step 4: sign-in-as-rider subflow**

Create `apps/mobile/.maestro/subflows/sign-in-as-rider.yaml`:

```yaml
appId: com.novagen.veteransfirst
env:
  PHONE: "2015550100"
---
- runFlow: reset-app.yaml
- tapOn: { text: "Get started", optional: true }
- tapOn: { text: "I already have an account", optional: true }
- tapOn: { id: "phone-input", optional: true }
- inputText: ${PHONE}
- tapOn: { text: "Send verification code", optional: true }
- tapOn: { text: "Continue", optional: true }
- inputText: "424242"
- extendedWaitUntil:
    visible: { text: "Book a Ride" }
    timeout: 20000
```

- [ ] **Step 5: sign-in-as-driver / sign-in-as-family subflows**

Create `sign-in-as-driver.yaml` (identical to Step 4 but `PHONE: "2015550101"` and final wait `visible: { id: "driver-status-toggle" }`) and `sign-in-as-family.yaml` (`PHONE: "2015550102"`, final wait `visible: { text: "Your riders" }`). Full content:

```yaml
# sign-in-as-driver.yaml
appId: com.novagen.veteransfirst
env: { PHONE: "2015550101" }
---
- runFlow: reset-app.yaml
- tapOn: { text: "Get started", optional: true }
- tapOn: { text: "I already have an account", optional: true }
- tapOn: { id: "phone-input", optional: true }
- inputText: ${PHONE}
- tapOn: { text: "Send verification code", optional: true }
- tapOn: { text: "Continue", optional: true }
- inputText: "424242"
- extendedWaitUntil: { visible: { id: "driver-status-toggle" }, timeout: 20000 }
```

```yaml
# sign-in-as-family.yaml
appId: com.novagen.veteransfirst
env: { PHONE: "2015550102" }
---
- runFlow: reset-app.yaml
- tapOn: { text: "Get started", optional: true }
- tapOn: { text: "I already have an account", optional: true }
- tapOn: { id: "phone-input", optional: true }
- inputText: ${PHONE}
- tapOn: { text: "Send verification code", optional: true }
- tapOn: { text: "Continue", optional: true }
- inputText: "424242"
- extendedWaitUntil: { visible: { text: "Your riders" }, timeout: 20000 }
```

- [ ] **Step 6: Ensure the phone-input selector exists**

Run: `grep -rn 'phone-input' apps/mobile/components apps/mobile/app` (look for the PhoneField testID).
If absent, add `testID="phone-input"` to the `TextInput` in the phone field component (e.g. `components/auth/PhoneField.tsx`) and `testID="otp-input"` to the OTP field, following the kebab convention.

- [ ] **Step 7: Verify a subflow runs (requires seeded sim)**

Run: `cd apps/mobile && maestro test .maestro/subflows/sign-in-as-rider.yaml`
Expected: PASS, landing on the rider home (Book a Ride visible).

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/.maestro/config.yaml apps/mobile/.maestro/subflows
git commit -m "feat(mobile): maestro config + reusable sign-in/reset/deep-link subflows"
```

---

## Task 6: Pre-auth flows

**Files:**

- Create: `apps/mobile/.maestro/pre-auth/{welcome,sign-in,sign-up,verify}.yaml`
- Delete: `apps/mobile/.maestro/smoke-welcome.yaml`, `apps/mobile/.maestro/rider-tour.yaml`

**Per-flow spec** (each flow: `appId` header, `tags`, the steps; screenshots named `<screen>-NN`):

| Flow      | tags         | Steps (after `runFlow: ../subflows/reset-app.yaml`)                                                                                                              |
| --------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `welcome` | `[pre-auth]` | assertVisible `Welcome`; assertVisible `Get started`; takeScreenshot `welcome-01`; tapOn `Get started`; takeScreenshot `welcome-02`                              |
| `sign-in` | `[pre-auth]` | tapOn `I already have an account` (optional); assertVisible `phone-input` (id); takeScreenshot `sign-in-01`                                                      |
| `sign-up` | `[pre-auth]` | tapOn `Get started`; tapOn `Create account`/`Sign up` (optional); assertVisible `phone-input` (id); takeScreenshot `sign-up-01`                                  |
| `verify`  | `[pre-auth]` | from sign-up: input test phone `2015550199`; tapOn `Send verification code` (optional); assertVisible the OTP field (`otp-input` id); takeScreenshot `verify-01` |

- [ ] **Step 1: Write `pre-auth/welcome.yaml`**

```yaml
appId: com.novagen.veteransfirst
tags: [pre-auth]
---
- runFlow: ../subflows/reset-app.yaml
- assertVisible: { text: "Welcome" }
- assertVisible: { text: "Get started" }
- takeScreenshot: welcome-01
- tapOn: { text: "Get started" }
- takeScreenshot: welcome-02
```

- [ ] **Step 2: Write the remaining three** per the table above (same header/tag pattern, selectors verified against `app/(auth)/sign-in.tsx`, `sign-up.tsx`, `verify.tsx`; prefer `id:` selectors that exist, fall back to visible text with `optional: true`).

- [ ] **Step 3: Delete superseded flows**

```bash
git rm apps/mobile/.maestro/smoke-welcome.yaml apps/mobile/.maestro/rider-tour.yaml
```

- [ ] **Step 4: Run the tag**

Run: `cd apps/mobile && maestro test --include-tags pre-auth .maestro`
Expected: all four PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/.maestro/pre-auth && git commit -m "test(mobile): pre-auth maestro flows; retire legacy smoke/rider-tour"
```

---

## Task 7: Onboarding flows

**Files:**

- Create: `apps/mobile/.maestro/onboarding/wizard.yaml` (behavioral: fresh sign-up → walk veteran→address→emergency→permissions→terms)
- Create: `apps/mobile/.maestro/onboarding/steps.yaml` (deep-link render check of each step route)

**Interfaces:** Consumes `subflows/deep-link.yaml`. Onboarding routes: `/(auth)/onboarding/{veteran,address,emergency-contact,permissions-location,permissions-notifications,terms}`.

- [ ] **Step 1: Write the wizard flow**

Sign up with a fresh test phone (`2015550110`, code `424242`), then advance each step tapping the primary CTA (verify exact labels in each `app/(auth)/onboarding/*.tsx`), screenshot each:

```yaml
appId: com.novagen.veteransfirst
tags: [onboarding]
---
- runFlow: ../subflows/reset-app.yaml
- tapOn: { text: "Get started" }
- tapOn: { text: "Create account", optional: true }
- tapOn: { id: "phone-input", optional: true }
- inputText: "2015550110"
- tapOn: { text: "Send verification code", optional: true }
- inputText: "424242"
- extendedWaitUntil: { visible: { text: "service" }, timeout: 20000 } # veteran step
- takeScreenshot: onboarding-veteran
- tapOn: { text: "Continue" }
- takeScreenshot: onboarding-address
- tapOn: { text: "Continue" }
- takeScreenshot: onboarding-emergency
- tapOn: { text: "Continue", optional: true }
- takeScreenshot: onboarding-permissions-location
- tapOn: { text: "Continue", optional: true }
- takeScreenshot: onboarding-permissions-notifications
- tapOn: { text: "Continue", optional: true }
- takeScreenshot: onboarding-terms
```

> Note: if Clerk dev forbids creating a user mid-flow with an already-seeded phone, this fresh phone (`…110`) avoids collision. Add it to the test-mode allow-list.

- [ ] **Step 2: Write the per-step render-check flow** using `deep-link` for each onboarding route, asserting one stable element + screenshot per step.

- [ ] **Step 3: Run + commit**

Run: `cd apps/mobile && maestro test --include-tags onboarding .maestro` → PASS.

```bash
git add apps/mobile/.maestro/onboarding && git commit -m "test(mobile): onboarding wizard + per-step render checks"
```

---

## Task 8: Rider flows — tabs + booking

**Files:**

- Create: `apps/mobile/.maestro/rider/{home,rides-tab,help,profile-tab,book-a-ride}.yaml`
- Modify (if needed): `app/(rider)/booking/index.tsx` — add `testID`s (confirmed missing).

**Interfaces:** Consumes `subflows/sign-in-as-rider.yaml`.

- [ ] **Step 1: Add missing booking testIDs**

In `app/(rider)/booking/index.tsx`, add `testID="booking-where-to"` to the destination entry control and `testID="booking-continue"` to the primary CTA (kebab convention). Confirm the rider tab bar items expose `accessibilityLabel`/text `Home`, `My Rides`, `Help`, `Profile`.

- [ ] **Step 2: Write `rider/book-a-ride.yaml`** (behavioral happy path):

```yaml
appId: com.novagen.veteransfirst
tags: [rider]
---
- runFlow: ../subflows/sign-in-as-rider.yaml
- tapOn: { text: "Book a Ride" }
- takeScreenshot: rider-booking-where
- tapOn: { id: "booking-where-to", optional: true }
- tapOn: { text: "VA Clinic", optional: true } # seeded saved place
- tapOn: { id: "booking-continue", optional: true }
- takeScreenshot: rider-booking-time
- tapOn: { text: "Continue", optional: true }
- takeScreenshot: rider-booking-confirm
- tapOn: { text: "Confirm", optional: true }
- takeScreenshot: rider-booking-success
```

- [ ] **Step 3: Write `home`, `rides-tab`, `help`, `profile-tab`** — each `runFlow: sign-in-as-rider`, tap the tab, assert one stable element (e.g. seeded ride visible on `rides-tab`), screenshot.

- [ ] **Step 4: Run + commit**

Run: `cd apps/mobile && maestro test --include-tags rider .maestro` (will also pick up Task 9 once added).

```bash
git add apps/mobile/.maestro/rider "apps/mobile/app/(rider)/booking/index.tsx" && git commit -m "test(mobile): rider tabs + book-a-ride flows (+booking testIDs)"
```

---

## Task 9: Rider flows — rides detail + profile sub-screens

**Files:**

- Create: `apps/mobile/.maestro/rider/{ride-detail,ride-modify,profile-saved-places,profile-add-place,profile-edit-place,profile-accessibility,profile-comfort,profile-notifications,profile-family-access,profile-family-add,profile-delete-account}.yaml`

**Pattern (reuse for each):** `runFlow: ../subflows/sign-in-as-rider.yaml` → navigate to the screen → assert one stable selector → screenshot. Tag `[rider]`.

**Per-flow navigation + assertion table** (selectors already exist — these screens are in the 425-testID set; verify each in its file):

| Flow file                | Navigate                                | Assert (stable)           | Screenshot             |
| ------------------------ | --------------------------------------- | ------------------------- | ---------------------- |
| `ride-detail`            | tap My Rides → tap seeded upcoming ride | ride status badge visible | `rider-ride-detail`    |
| `ride-modify`            | from ride-detail → tap "Modify"         | modify form visible       | `rider-ride-modify`    |
| `profile-saved-places`   | Profile tab → "Saved places"            | seeded "Home" row         | `rider-saved-places`   |
| `profile-add-place`      | Saved places → "Add place"              | address input             | `rider-add-place`      |
| `profile-edit-place`     | Saved places → tap "Home"               | prefilled label           | `rider-edit-place`     |
| `profile-accessibility`  | Profile → "Accessibility"               | a toggle row              | `rider-accessibility`  |
| `profile-comfort`        | Profile → "Comfort"                     | a toggle row              | `rider-comfort`        |
| `profile-notifications`  | Profile → "Notifications"               | a toggle row              | `rider-notifications`  |
| `profile-family-access`  | Profile → "Family access"               | list or empty state       | `rider-family-access`  |
| `profile-family-add`     | Family access → "Add"                   | phone/contact input       | `rider-family-add`     |
| `profile-delete-account` | Profile → "Delete account"              | confirm/danger text       | `rider-delete-account` |

- [ ] **Step 1: Write all 11 flows** per the table, one fully-worked example first:

```yaml
# rider/profile-saved-places.yaml
appId: com.novagen.veteransfirst
tags: [rider]
---
- runFlow: ../subflows/sign-in-as-rider.yaml
- tapOn: { text: "Profile" }
- tapOn: { text: "Saved places" }
- assertVisible: { text: "Home" }
- takeScreenshot: rider-saved-places
```

- [ ] **Step 2: Run + commit**

Run: `cd apps/mobile && maestro test --include-tags rider .maestro` → all PASS.

```bash
git add apps/mobile/.maestro/rider && git commit -m "test(mobile): rider ride-detail/modify + profile sub-screen flows"
```

---

## Task 10: Driver flows

**Files:**

- Create: `apps/mobile/.maestro/driver/{home-online,earnings,schedule,profile,trip-detail}.yaml`

**Interfaces:** Consumes `subflows/sign-in-as-driver.yaml`. Known selectors: `driver-status-toggle`, `trip-card-${id}`, `empty-trip-queue`.

- [ ] **Step 1: Write `driver/home-online.yaml`**:

```yaml
appId: com.novagen.veteransfirst
tags: [driver]
---
- runFlow: ../subflows/sign-in-as-driver.yaml
- assertVisible: { id: "driver-status-toggle" }
- takeScreenshot: driver-home-offline
- tapOn: { id: "driver-status-toggle" }
- takeScreenshot: driver-home-online
- tapOn: { id: "trip-card-.*", optional: true } # seeded assigned trip
- takeScreenshot: driver-trip-detail
```

- [ ] **Step 2: Write `earnings`, `schedule`, `profile`, `trip-detail`** — tab nav + assert (schedule shows seeded Mon/Wed availability; earnings shows a total; trip-detail reached via the seeded assigned ride), screenshot each.

- [ ] **Step 3: Run + commit**

Run: `cd apps/mobile && maestro test --include-tags driver .maestro` → PASS.

```bash
git add apps/mobile/.maestro/driver && git commit -m "test(mobile): driver day flows (online, trip, earnings, schedule, profile)"
```

---

## Task 11: Family flows

**Files:**

- Create: `apps/mobile/.maestro/family/{riders-list,rider-detail,book-for-rider,ride-detail}.yaml`

**Interfaces:** Consumes `subflows/sign-in-as-family.yaml`. The seeded family user has an approved link to the rider.

- [ ] **Step 1: Write `family/book-for-rider.yaml`**:

```yaml
appId: com.novagen.veteransfirst
tags: [family]
---
- runFlow: ../subflows/sign-in-as-family.yaml
- assertVisible: { text: "Your riders" }
- takeScreenshot: family-riders-list
- tapOn: { text: "Test Rider" } # seeded linked rider
- takeScreenshot: family-rider-detail
- tapOn: { text: "Book a ride", optional: true }
- takeScreenshot: family-book
```

- [ ] **Step 2: Write `riders-list`, `rider-detail`, `ride-detail`** per the same pattern (ride-detail opens the rider's seeded ride).

- [ ] **Step 3: Run + commit**

Run: `cd apps/mobile && maestro test --include-tags family .maestro` → PASS.

```bash
git add apps/mobile/.maestro/family && git commit -m "test(mobile): family book-for-rider flows"
```

---

## Task 12: Edge + legal render-checks

**Files:**

- Create: `apps/mobile/.maestro/edge-and-legal/{edge-offline,edge-suspended,edge-update-required,legal-privacy,legal-terms,support,not-found,wrong-role}.yaml`

**Pattern:** deep-link to the route, assert one stable element, screenshot. Tag `[edge]`.

**Route table:**

| Flow                   | LINK                                                                  | Assert               |
| ---------------------- | --------------------------------------------------------------------- | -------------------- |
| `edge-offline`         | `veterans-first://edge/offline`                                       | `You're offline`     |
| `edge-suspended`       | `veterans-first://edge/account-suspended`                             | suspended heading    |
| `edge-update-required` | `veterans-first://edge/update-required`                               | update heading       |
| `legal-privacy`        | `veterans-first://legal/privacy`                                      | privacy heading      |
| `legal-terms`          | `veterans-first://legal/terms`                                        | terms heading        |
| `support`              | `veterans-first://support`                                            | support/contact text |
| `not-found`            | `veterans-first://this/does/not/exist`                                | not-found text       |
| `wrong-role`           | sign-in as a user whose role has no mobile home (deep-link or seeded) | wrong-role message   |

- [ ] **Step 1: Write one worked example**:

```yaml
# edge-and-legal/edge-offline.yaml
appId: com.novagen.veteransfirst
tags: [edge]
env: { LINK: "veterans-first://edge/offline" }
---
- runFlow: ../subflows/reset-app.yaml
- runFlow: ../subflows/deep-link.yaml
- assertVisible: { text: "You're offline" }
- takeScreenshot: edge-offline
```

- [ ] **Step 2: Write the rest** per the route table (verify each asserted string against the screen's source; `wrong-role` may need a deep-link to a role group the signed-in user can't access).

- [ ] **Step 3: Run + commit**

Run: `cd apps/mobile && maestro test --include-tags edge .maestro` → PASS.

```bash
git add apps/mobile/.maestro/edge-and-legal && git commit -m "test(mobile): edge-state + legal render checks"
```

---

## Task 13: Rewrite the run guide

**Files:**

- Modify: `apps/mobile/.maestro/README.md`

- [ ] **Step 1: Rewrite** the README to document: prerequisites, the seed (`npm run e2e:seed` / `:teardown`), the build step, running all flows (`npm run e2e:ios`) and by tag (`npm run e2e:ios:tag rider`), the folder taxonomy, the behavioral-vs-render-check distinction, the dev-client bundle-load dance (preserve from the current README), and a "Verified" log section. Remove references to the deleted `smoke-welcome.yaml`/`rider-tour.yaml`.

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/.maestro/README.md && git commit -m "docs(mobile): rewrite maestro run guide for seeded e2e harness"
```

---

## Task 14: Opt-in CI workflow

**Files:**

- Create: `.github/workflows/e2e-mobile.yml`

- [ ] **Step 1: Write the workflow** (`workflow_dispatch` only — no PR trigger):

```yaml
name: Mobile E2E (Maestro)
on:
  workflow_dispatch:
# Manual only. Requires secrets: EXPO_TOKEN, CLERK_SECRET_KEY,
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.
jobs:
  e2e:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - name: Seed test data
        working-directory: apps/mobile
        env:
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: npm run e2e:seed
      - name: Build iOS (Release) + boot simulator
        working-directory: apps/mobile
        run: |
          xcrun simctl boot "iPhone 16 Pro" || true
          npx expo run:ios --configuration Release
      - name: Install Maestro
        run: curl -Ls https://get.maestro.mobile.dev | bash
      - name: Run flows
        working-directory: apps/mobile
        run: $HOME/.maestro/bin/maestro test .maestro
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: maestro-screenshots, path: ~/.maestro/tests/** }
```

- [ ] **Step 2: Validate YAML**

Run: `cd /Users/urelmattis/Developer/veterans-first-app && python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/e2e-mobile.yml')); print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/e2e-mobile.yml && git commit -m "ci(mobile): opt-in workflow_dispatch maestro e2e job"
```

---

## Self-Review notes

- **Spec coverage:** seed (Tasks 1-4), `.maestro` restructure + subflows (Task 5), pre-auth (6), onboarding (7), rider all sub-screens (8-9), driver (10), family (11), edge+legal render-checks (12), README (13), opt-in CI (14). Every inventory row maps to a task.
- **Render-check vs behavioral** honored: edge/legal/not-found/wrong-role are deep-link checks (Task 12); detail screens are behavioral (Tasks 9-11).
- **testID gaps** addressed where confirmed (`booking/index` Task 8; `phone-input`/`otp-input` Task 5); other screens already instrumented — each flow step verifies its selector against source before relying on it.
- **Out-of-scope** preserved: no edge-state trigger wiring, no app behavior changes beyond testIDs.
