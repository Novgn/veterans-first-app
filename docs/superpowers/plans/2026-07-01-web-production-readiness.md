# Web Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take `apps/web` from a preview-only, test-credentialed demo to a state where a `vercel --prod` deploy on real credentials is safe and meaningful.

**Architecture:** Three engineering fixes (unblock serverless DB writes on the Supabase transaction pooler; wire Resend into the waitlist behind an env flag; make the support phone a single config value) plus a human-owned provisioning + cutover runbook (real Clerk/Supabase, Vercel↔GitHub, deployment protection, domain). Code changes ship through the gated `feature → dev → stage → main` branch model; production is promoted only after the env matrix is real and the DB fix is verified.

**Tech Stack:** Next.js App Router (`apps/web`), Drizzle + `postgres` (postgres.js) against Supabase Supavisor pooler, `@supabase/supabase-js` (PostgREST) for serverless-safe access, Clerk auth, Turbo monorepo, Vercel CLI deploys, Vitest in `packages/shared`.

## Global Constraints

- **Node 20 for all local verification** — CI runs Node 20 (`.nvmrc`); Node 22/macOS results lie. Use `export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"`.
- **No test runner in `apps/web`** — there is no vitest/jest in the web app; web-route "verification" = typecheck + `next build` + running the app (curl/Playwright). Do NOT invent a web test harness. `packages/shared` DOES have Vitest (`fileParallelism: false`) — DB-client tests go there.
- **Build needs a placeholder `DATABASE_URL`** — `@veterans-first/shared/db` opens a postgres client at import; `next build` fails without the env var set.
- **Ship via the gated branch model** — `feature → dev → stage → main`, all protected (PR + 5 checks, strict, no force-push). Do NOT deploy prod from the current `test/mobile-maestro-e2e` branch.
- **Marketing/console separation is a hard rule** — marketing pages stay public; `/admin`,`/dispatch`,`/business` stay Clerk-gated. Do not change protection semantics.
- **Design tokens only** — reuse existing DS tokens (`bg-sage`, `text-brass`, etc.); no new hardcoded colors.
- **Never log PII** — the waitlist route deliberately never logs the email address; keep it that way when adding Resend.
- **Preview-only today** — no production deployment has ever existed by design; treat the first prod promotion as a launch event, not a routine deploy.

---

## Command & State Corrections (verified 2026-07-02 against `dev` after integration)

This repo uses **npm workspaces + turbo**, NOT pnpm, and the turbo task is **`typecheck`** (not `type-check`). Everywhere below, translate the commands:

| Plan text (pnpm)                                   | Correct command (npm/turbo)                                         |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm --filter web type-check`                     | `npm run typecheck -w web` (or `npm run typecheck` for all)         |
| `pnpm --filter web build`                          | `npx turbo run build --filter=web` (builds shared dep first)        |
| `pnpm --filter web dev`                            | `npm run dev -w web`                                                |
| `pnpm --filter web add resend`                     | `npm install resend -w web`                                         |
| `pnpm --filter @veterans-first/shared test [-- X]` | `npm test -w @veterans-first/shared [-- X]` (script = `vitest run`) |
| `pnpm-lock.yaml` (in `git add`)                    | `package-lock.json`                                                 |

State changes since the plan was written (confirmed on merged `dev`):

- **Task 4 is obsolete** — `apps/web/lib/app-env.ts` now exists on `dev` (the app-env-seam merge). `NEXT_PUBLIC_APP_ENV` is no longer a dead var. Skip Task 4.
- **Task 2 premise partially done** — the waitlist route already inserts via `getServiceRoleSupabase()` (serverless-safe). Task 2 only adds the Resend confirmation on top.
- **Vercel↔GitHub is connected** — PRs get a Vercel preview deployment (the "Vercel-not-connected gap" in older notes is closed).

## Current State & Environment / Credential Matrix

Verified 2026-07-01 against the code and `vercel env ls production --scope novagen`.

| Concern                                                                                             | Now                                                                                                                              | Real prod needs                                                                                              | Owner                       |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------- |
| Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)                                | **Test** instance keys (set 14d ago)                                                                                             | A Clerk **production** instance + live `pk_live_…`/`sk_live_…`, production domain, social/OAuth reconfigured | You (Clerk dashboard)       |
| `CLERK_BILLING_WEBHOOK_SIGNING_SECRET`                                                              | Not set on Vercel                                                                                                                | Set for prod Clerk webhook (Story 3.2 route) if billing is live                                              | You                         |
| Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) | **Dev** project                                                                                                                  | A dedicated **production** Supabase project, migrations applied, RLS verified                                | You + me (migrations)       |
| `DATABASE_URL`                                                                                      | Dev; format unverified (direct `:5432` vs pooler `:6543`)                                                                        | Prod project's **transaction pooler** (`:6543`) connection string                                            | You + me                    |
| `NEXT_PUBLIC_APP_ENV`                                                                               | `production` on Prod, but **no web code reads it** — the `lib/app-env.ts` seam the memory describes does not exist in `apps/web` | Decide: wire it or remove it (Task 4, optional)                                                              | Me                          |
| Support phone                                                                                       | `(919) 555-0100` hardcoded in 6 marketing spots                                                                                  | Real number, one config value                                                                                | You (number) + me (Task 3)  |
| Waitlist email                                                                                      | Persist-only, no provider                                                                                                        | Resend account + verified sending domain + `RESEND_API_KEY`                                                  | You (account) + me (Task 2) |
| DB writes on serverless                                                                             | `getDb()` (postgres.js pooler) reportedly 500s on Vercel                                                                         | Fixed & verified (Task 1)                                                                                    | Me                          |
| Vercel↔GitHub                                                                                       | Not connected                                                                                                                    | Connected so `dev`/`stage` auto-preview and prod is git-driven                                               | You (org OAuth)             |
| Deployment Protection                                                                               | OFF (public preview)                                                                                                             | Decide prod posture (marketing public; consoles already Clerk-gated)                                         | You                         |
| Domain                                                                                              | `*.vercel.app` only                                                                                                              | Real production domain + DNS                                                                                 | You                         |

**Legend of what I can do without you:** Tasks 1–4 (code). Everything marked "You" is a credential/provisioning/decision gate documented in the Provisioning Runbook below — I will prepare the steps but cannot execute them.

---

## Provisioning Runbook (human-owned — gates the prod promotion)

These are **not** code tasks. They must be done (by you) before `vercel --prod` is meaningful. I can script/verify where noted.

1. **Clerk production instance** — Create a production instance in the Clerk dashboard, set the production domain, migrate OAuth providers, copy `pk_live_…` / `sk_live_…`. → set as Vercel **Production** env (`vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production`, `CLERK_SECRET_KEY production`). Note: `vercel env add … preview` hangs on the git-branch prompt in non-interactive mode — use the REST API for preview if needed.
2. **Supabase production project** — Create a new project (or promote), apply all migrations (`packages/shared` Drizzle migrations), verify RLS policies, capture the API URL, anon key, service-role key, and the **transaction pooler** `DATABASE_URL` (`…pooler.supabase.com:6543`, username `postgres.<project-ref>`). → set the 4 vars on Vercel Production.
3. **Resend** — Create account, verify the sending domain (SPF/DKIM), create an API key. → set `RESEND_API_KEY` and `WAITLIST_FROM_EMAIL` on Vercel Production (and preview if you want confirmations there). Consumed by Task 2.
4. **Support phone** — Decide the real number. → set `NEXT_PUBLIC_SUPPORT_PHONE` on Vercel (all environments). Consumed by Task 3.
5. **Vercel↔GitHub** — Authorize the Vercel GitHub app on the Novgn org, then `vercel git connect`. Enables `dev`/`stage` auto-previews and git-driven prod.
6. **Deployment Protection** — Decide prod posture. Marketing must stay public; consoles are already Clerk-gated at the app layer, so Vercel-level protection is optional. If you enable it, exclude the marketing routes.
7. **Domain** — Add the production domain in Vercel, configure DNS, set as the Production alias.

**Verification I can run for you** once you've set the vars: `vercel env ls production --scope novagen` (presence), a preview deploy + smoke check, and the Task 1 pooler probe against the real prod `DATABASE_URL`.

---

## Task 1: Root-cause & fix serverless DB writes (Supabase transaction pooler)

**Why first:** This is the only hard engineering blocker. Authed routes (`api/webhooks/clerk`, `api/notifications/{reminders,ride,driver}`, `lib/notifications/dispatch.ts`) all use `getDb()`. If they 500 on serverless, real prod is broken regardless of credentials. The queries are rich (joins, `leftJoin`, raw `sql` JSONB filters, `.returning()`) — a wholesale rewrite to PostgREST is high-risk, so we fix the client instead and keep Drizzle.

**Hypothesis (to confirm, not assume):** The failure is **transaction-pooler-specific**, not generically serverless. Local works because `DATABASE_URL` is the direct connection (`:5432`, session mode); Vercel uses the Supavisor transaction pooler (`:6543`), which forbids prepared statements and needs `prepare: false` **plus** `fetch_types: false` (postgres.js otherwise issues a type-introspection round-trip that breaks in transaction mode). If confirmed, this reproduces locally by pointing at the pooler URL — no Vercel round-trip needed.

**Files:**

- Modify: `packages/shared/src/db/client.ts` (the `getDb()` factory + legacy singleton)
- Create: `packages/shared/src/db/client.pooler.test.ts` (opt-in integration test, guarded by env)
- Verify (no change): the 5 consumer routes/libs listed above

**Interfaces:**

- Consumes: `process.env.DATABASE_URL` (and a new opt-in `POOLER_DATABASE_URL` for the test only)
- Produces: `getDb(): DrizzleDb` — signature unchanged; only the underlying `postgres()` options change

- [ ] **Step 1: Confirm the deployed connection string shape.** Ask which port the prod/dev `DATABASE_URL` uses. `vercel env pull .env.vercel.production --environment=production --scope novagen` into the scratchpad (NOT the repo), and check whether the host is `…pooler.supabase.com:6543` (transaction) vs `…supabase.co:5432` (direct). Record the finding. Delete the pulled file afterward.

- [ ] **Step 2: Reproduce locally against the pooler.** With Node 20, run a one-off probe pointing at the pooler URL (use the scratchpad, never commit the URL):

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
DATABASE_URL='<transaction-pooler-url>' node -e "
  const postgres = require('postgres');
  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  sql\`select 1 as ok\`.then(r => { console.log('OK', r); return sql.end(); })
     .catch(e => { console.error('FAIL', e.message); process.exit(1); });
"
```

Expected: reproduces the reported failure (query fails though the connection opens). If it already succeeds, the pooler config is fine — jump to Step 6 and re-scope this task to a live serverless smoke test instead.

- [ ] **Step 3: Write the failing opt-in integration test** in `packages/shared/src/db/client.pooler.test.ts`. It is skipped unless `POOLER_DATABASE_URL` is set (so CI, which uses local Supabase in session mode, stays green):

```ts
import { describe, it, expect } from "vitest";
import postgres from "postgres";

const poolerUrl = process.env.POOLER_DATABASE_URL;

describe.skipIf(!poolerUrl)("postgres.js against Supabase transaction pooler", () => {
  it("runs a parameterized query without prepared-statement errors", async () => {
    // Mirror getDb()'s options so this test guards the real config.
    const sql = postgres(poolerUrl!, { prepare: false, fetch_types: false, max: 1 });
    try {
      const rows = await sql`select ${"ok"}::text as val`;
      expect(rows[0]?.val).toBe("ok");
    } finally {
      await sql.end();
    }
  });
});
```

- [ ] **Step 4: Run the test to confirm current failure.**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
POOLER_DATABASE_URL='<transaction-pooler-url>' pnpm --filter @veterans-first/shared test -- client.pooler
```

Expected: FAIL (reproduces the pooler error). If it PASSES, the fix is already present in the options — reconcile with `client.ts` and skip to Step 6.

- [ ] **Step 5: Apply the fix** in `packages/shared/src/db/client.ts` — add `fetch_types: false` (transaction-mode safe) and serverless-friendly pool sizing to both the `getDb()` factory and the legacy singleton. Replace the two `postgres(...)` calls:

```ts
const POSTGRES_OPTIONS = {
  prepare: false, // Supabase pooler is pgbouncer/Supavisor transaction mode — no session state
  fetch_types: false, // skip the type-introspection round-trip that breaks in transaction mode
  max: 1, // one connection per serverless instance; the pooler multiplexes
  idle_timeout: 20,
  connect_timeout: 10,
} as const;
```

Then `const queryClient = postgres(getDatabaseUrl(), POSTGRES_OPTIONS);` in `getDb()`, and `export const client = postgres(getDatabaseUrl(), POSTGRES_OPTIONS);` for the legacy singleton. Update the file's header comment to explain `fetch_types: false` alongside the existing `prepare: false` note.

- [ ] **Step 6: Re-run the test to confirm the fix.**

```bash
POOLER_DATABASE_URL='<transaction-pooler-url>' pnpm --filter @veterans-first/shared test -- client.pooler
```

Expected: PASS.

- [ ] **Step 7: Confirm CI-path tests still pass** (local Supabase, session mode — the opt-in test skips):

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
pnpm --filter @veterans-first/shared test
```

Expected: PASS, with the pooler test reported as skipped.

- [ ] **Step 8: Typecheck the web app** (consumers unchanged, but confirm nothing broke):

```bash
pnpm --filter web type-check
```

Expected: PASS.

- [ ] **Step 9: Commit.**

```bash
git add packages/shared/src/db/client.ts packages/shared/src/db/client.pooler.test.ts
git commit -m "fix(db): make getDb() safe on the Supabase transaction pooler (fetch_types:false, pool sizing)"
```

- [ ] **Step 10: Live verification (post-provisioning).** After a preview deploy on the prod Supabase pooler URL, exercise one authed write path (e.g., trigger a `notifications/ride` event with a seeded Clerk session) and confirm a 200 + a `notification_logs` row, and `vercel logs <url> --level error` is clean. This is the real acceptance gate; the local pooler test is the fast proxy. If the live path still fails, escalate to the PostgREST fallback (below).

**Fallback (only if Steps 5–6 do not resolve it):** Migrate the failing writes to `getServiceRoleSupabase()` (PostgREST), per-file, smallest first: `dispatch.ts` `notification_logs` insert → then `notifications/*`. Rewrite each Drizzle query as a `supabase.from(...).select/insert/update`, translating the JSONB `receive_notifications` filter to a `.filter('permissions->>receive_notifications','eq','true')` and `.returning()` to `.select()` after insert. This is a large change — do it as its own plan, not inline, and keep the Drizzle path for CI/local.

---

## Task 2: Wire Resend into the waitlist (no-op until keyed)

**Why:** The "we'll email you at launch" copy is currently an unbacked promise. Wire Resend so it sends when configured and is a safe no-op otherwise — decoupling the code change from the account setup.

**Files:**

- Modify: `apps/web/package.json` (add `resend`)
- Create: `apps/web/lib/email/resend.ts` (client + `sendWaitlistConfirmation`)
- Modify: `apps/web/app/api/waitlist/route.ts` (call after a _new_ signup only)
- Modify: `.env.example` (document `RESEND_API_KEY`, `WAITLIST_FROM_EMAIL`)

**Interfaces:**

- Produces: `sendWaitlistConfirmation(email: string): Promise<void>` — resolves silently; never throws (email is best-effort and must not fail the request)
- Consumes: `process.env.RESEND_API_KEY`, `process.env.WAITLIST_FROM_EMAIL`

- [ ] **Step 1: Add the dependency.**

```bash
pnpm --filter web add resend
```

- [ ] **Step 2: Create `apps/web/lib/email/resend.ts`.**

```ts
import "server-only";

import { Resend } from "resend";

import { log } from "@/lib/logger";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.WAITLIST_FROM_EMAIL;

/**
 * Best-effort waitlist confirmation. No-ops (logs and returns) when Resend
 * is unconfigured, so the code can ship before the account/domain exist.
 * Never throws — a mail failure must not fail the signup request. Never logs
 * the email address (PII).
 */
export async function sendWaitlistConfirmation(email: string): Promise<void> {
  if (!apiKey || !fromEmail) {
    log.info({ event: "waitlist.email.skipped" }, "resend not configured; skipping confirmation");
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "You're on the list — Veterans First",
      text: "Thanks for joining the Veterans First waitlist. We'll email you the moment the app is available to ride.",
    });
    log.info({ event: "waitlist.email.sent" }, "waitlist confirmation sent");
  } catch (err) {
    log.error(
      { event: "waitlist.email.error", err: err instanceof Error ? err.message : String(err) },
      "waitlist confirmation failed"
    );
  }
}
```

- [ ] **Step 3: Call it on a new signup** in `apps/web/app/api/waitlist/route.ts`. After the successful insert (the `log.info({ event: 'waitlist.signup' … })` line, NOT the 23505 duplicate branch), add:

```ts
await sendWaitlistConfirmation(email);
```

and add the import near the other `@/lib` imports:

```ts
import { sendWaitlistConfirmation } from "@/lib/email/resend";
```

Also update the file header NOTE (lines ~15–17) to say Resend is now wired but no-ops until `RESEND_API_KEY`/`WAITLIST_FROM_EMAIL` are set.

- [ ] **Step 4: Document env vars** — add to `.env.example` under the WEB section:

```
# Resend — waitlist confirmation email (optional; no-ops if unset).
# https://resend.com → API Keys, and verify your sending domain.
RESEND_API_KEY=
WAITLIST_FROM_EMAIL=
```

- [ ] **Step 5: Typecheck.**

```bash
pnpm --filter web type-check
```

Expected: PASS.

- [ ] **Step 6: Functional check (no key = no-op).** With `RESEND_API_KEY` unset, run the web app and POST a signup; confirm 200 `{ ok: true }` and a `waitlist.email.skipped` log line, and that the row still inserts.

```bash
pnpm --filter web dev &
curl -s -X POST localhost:3000/api/waitlist -H 'content-type: application/json' -d '{"email":"probe+resend@example.com"}'
```

Expected: `{"ok":true}` and the skipped log; kill the dev server after.

- [ ] **Step 7: Commit.**

```bash
git add apps/web/package.json apps/web/lib/email/resend.ts apps/web/app/api/waitlist/route.ts .env.example pnpm-lock.yaml
git commit -m "feat(waitlist): send Resend confirmation on signup (no-op until keyed)"
```

---

## Task 3: Make the support phone a single config value

**Why:** `(919) 555-0100` is hardcoded in 6 spots (via `PhoneButton` props and as inline text). One config value makes the real number a one-line launch change.

**Files:**

- Create: `apps/web/lib/site-config.ts`
- Modify: `apps/web/components/marketing/Hero.tsx:73`
- Modify: `apps/web/components/marketing/MarketingNav.tsx:67,130`
- Modify: `apps/web/components/marketing/CtaBand.tsx:60`
- Modify: `apps/web/components/marketing/MarketingFooter.tsx:68`
- Modify: `apps/web/components/marketing/AppDownload.tsx:10(comment),49`
- Modify: `.env.example` (document `NEXT_PUBLIC_SUPPORT_PHONE`)

**Interfaces:**

- Produces: `SUPPORT_PHONE: string` (display form, e.g. `(919) 555-0100`) — from `process.env.NEXT_PUBLIC_SUPPORT_PHONE`, falling back to the current placeholder so nothing breaks pre-launch.

- [ ] **Step 1: Create `apps/web/lib/site-config.ts`.**

```ts
// Site-wide marketing config. Swap the support number at launch by setting
// NEXT_PUBLIC_SUPPORT_PHONE; the placeholder keeps pre-launch builds working.
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "(919) 555-0100";
```

- [ ] **Step 2: Replace the `PhoneButton` usages.** In `Hero.tsx` and `MarketingNav.tsx`, import `SUPPORT_PHONE` and pass it as `phone`, interpolating it into the label where the number appears:
  - `Hero.tsx:73` → `<PhoneButton label={`Or call ${SUPPORT_PHONE}`} phone={SUPPORT_PHONE} />`
  - `MarketingNav.tsx:67` → keep `label="Call us"`, set `phone={SUPPORT_PHONE}`
  - `MarketingNav.tsx:130` → `<PhoneButton label={`Call ${SUPPORT_PHONE}`} phone={SUPPORT_PHONE} className="w-full" />`

- [ ] **Step 3: Replace the inline-text usages** in `CtaBand.tsx:60`, `MarketingFooter.tsx:68`, `AppDownload.tsx:49` — import `SUPPORT_PHONE` and render `{SUPPORT_PHONE}` instead of the literal. Update the `AppDownload.tsx:10` comment to note the number now comes from `site-config`.

- [ ] **Step 4: Confirm no literal remains.**

```bash
grep -rn "555-0100" apps/web --include="*.tsx" --include="*.ts" | grep -v site-config.ts
```

Expected: only `site-config.ts` (the fallback) matches; components no longer contain the literal.

- [ ] **Step 5: Document env var** — add to `.env.example` under WEB:

```
# Public support phone shown across the marketing site (display format).
NEXT_PUBLIC_SUPPORT_PHONE=
```

- [ ] **Step 6: Typecheck + build.**

```bash
pnpm --filter web type-check && DATABASE_URL='postgres://placeholder' pnpm --filter web build
```

Expected: PASS (placeholder `DATABASE_URL` required for build per Global Constraints).

- [ ] **Step 7: Visual check.** Run the app and confirm the number still renders in the hero, nav (desktop + mobile), CTA band, and footer, and that `tel:` links dial correctly (Playwright or manual).

- [ ] **Step 8: Commit.**

```bash
git add apps/web/lib/site-config.ts apps/web/components/marketing/*.tsx .env.example
git commit -m "refactor(marketing): source support phone from site-config/env"
```

---

## Task 4 (optional): Resolve the dead `NEXT_PUBLIC_APP_ENV`

**Why:** It's set on Vercel Production but nothing in `apps/web` reads it (the `lib/app-env.ts` seam the memory describes doesn't exist). Either wire it or drop it so config stays honest.

- [ ] **Step 1: Confirm** it's unreferenced: `grep -rn "APP_ENV" apps/web --include="*.ts" --include="*.tsx" | grep -v node_modules` → expect no hits.
- [ ] **Step 2: Decide with the user** — (a) remove the Vercel var (`vercel env rm NEXT_PUBLIC_APP_ENV production --scope novagen`), or (b) create `apps/web/lib/app-env.ts` exposing a typed `APP_ENV` and consume it where environment-gating is actually needed. Default recommendation: remove it until there's a real consumer (YAGNI).
- [ ] **Step 3: Commit** any code change; env removal is an ops action, not a commit.

---

## Cutover & Rollback Runbook

**Preconditions (all must be true):** Provisioning Runbook complete; Tasks 1–3 merged to `main`; Task 1 Step 10 live-verified on a preview against the prod Supabase pooler; `vercel env ls production` shows live Clerk + prod Supabase + `RESEND_API_KEY` + `NEXT_PUBLIC_SUPPORT_PHONE`.

- [ ] Merge through `dev → stage → main` (all 5 checks green at each gate).
- [ ] From `main`, deploy: `vercel deploy --prod --archive=tgz --yes --scope novagen` (or `vercel --prod` once Vercel↔GitHub is connected and prod is git-driven).
- [ ] Capture the deployment URL + `git rev-parse --short HEAD`.
- [ ] Smoke: marketing home 200 & public; `/admin` 404 / `/console` 307 to sign-in when logged out (console separation intact); a real Clerk sign-in reaches a console; a waitlist POST returns `{ok:true}` and (if keyed) sends.
- [ ] Wait 60s, then `vercel logs <url> --level error --since 1h` — expect clean; investigate any 500s (correlate with the Task 1 DB path first).

**Rollback:** `vercel ls` to find the prior READY prod deployment, then `vercel promote <previous-deployment-url> --scope novagen` (or `vercel rollback`). Because prod didn't exist before, the first-ever prod deploy has no rollback target — mitigate by keeping the preview alias (`veterans1st-staging.vercel.app`) pointed at a known-good build during cutover.

---

## Self-Review

- **Spec coverage:** DB serverless blocker → Task 1. Resend → Task 2. Phone config → Task 3. Launch plan doc → this document (env matrix + provisioning + cutover/rollback). Dead APP_ENV → Task 4. Branch/gating + Vercel↔GitHub + protection + domain → Provisioning Runbook + Cutover. ✅
- **Placeholder scan:** All code steps show real code; commands have expected output. The only conditional is Task 1's fallback, which is explicitly scoped as a separate plan, not an inline placeholder.
- **Type consistency:** `getDb()` signature unchanged; `sendWaitlistConfirmation(email: string): Promise<void>` used consistently; `SUPPORT_PHONE: string` referenced identically in all three component edits.
- **Known adaptation:** `apps/web` has no test runner, so web tasks verify via typecheck/build/run rather than unit tests (per Global Constraints); the one unit test added lives in `packages/shared` where Vitest exists and is opt-in so CI stays green.
