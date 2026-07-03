# Admin Subdomain Host Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve all three console sections at `admin.vf1st.com` and make `www.vf1st.com` a pure marketing site, per the approved spec `docs/superpowers/specs/2026-07-03-admin-subdomain-design.md`.

**Architecture:** Host canonicalization inside the existing `clerkMiddleware` callback (www+console path → 308 to admin host; admin host+non-allowlisted path → 308 to www; unknown hosts no-op), plus a `/console` role-dispatcher server component that fans signed-in staff into their section and exits everyone else to marketing. One app, one deploy; Clerk untouched.

**Tech Stack:** Next.js App Router (`apps/web`), `@clerk/nextjs` middleware, npm workspaces + Turbo monorepo, bash + curl for behavioral verification (no web unit-test harness exists, by rule).

## Global Constraints

- **Node 20 for all local verification** — CI runs Node 20 (`.nvmrc`). Prefix every session: `export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"`.
- **No test runner in `apps/web`** — do NOT add vitest/jest. Verification = typecheck + `next build` + `next start` + the curl matrix.
- **Build needs `DATABASE_URL`** — `@veterans-first/shared/db` opens a postgres client at import. `apps/web/.env.local` normally supplies it; if a build fails on a missing `DATABASE_URL`, export the placeholder: `export DATABASE_URL='postgresql://placeholder:placeholder@localhost:5432/placeholder'`.
- **Ship via the gated branch model** — `feature/admin-subdomain → dev → stage → main`, all protected (PR + 5 checks: Lint, Format, Type Check, Test, Build).
- **Marketing/console separation is a hard rule** — this feature strengthens it; never weaken the Clerk gate or the layouts' role checks.
- **Hosts:** marketing `www.vf1st.com`, consoles `admin.vf1st.com`, apex 308s to www (already live). Unknown hosts (previews, localhost, `*.vercel.app`) must behave exactly as today.
- **Working tree hygiene:** the repo has unrelated modified `.claude/skills/*` files — never `git add -A`; stage only the files each task names.

---

## Task 1: Host constants + middleware host canonicalization

**Files:**

- Modify: `apps/web/lib/site-config.ts`
- Modify: `apps/web/middleware.ts`

**Interfaces:**

- Consumes: existing `clerkMiddleware` structure and `config.matcher` (unchanged).
- Produces: `MARKETING_HOST: 'www.vf1st.com'` and `ADMIN_HOST: 'admin.vf1st.com'` exported from `@/lib/site-config` (Task 2 imports `ADMIN_HOST` and `MARKETING_HOST`); the routing behavior Task 3's script asserts.

- [ ] **Step 1: Add the host constants** to the end of `apps/web/lib/site-config.ts`:

```ts
// Production hosts for host-based canonicalization (middleware.ts).
// Consoles live on the admin host; marketing on www. Any other host
// (previews, localhost) is intentionally left untouched, so these are
// plain constants — no env override needed.
export const MARKETING_HOST = "www.vf1st.com";
export const ADMIN_HOST = "admin.vf1st.com";
```

- [ ] **Step 2: Replace `apps/web/middleware.ts`** with:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_HOST, MARKETING_HOST } from "@/lib/site-config";

// Protected routes for the veterans-first console.
//
// Section layouts (apps/web/app/{dispatch,admin,business}/layout.tsx)
// also call getCurrentUserWithRole() and redirect on wrong-role —
// this matcher is the coarse first gate (auth required), and the
// layouts apply finer per-role checks.
const isProtectedRoute = createRouteMatcher([
  "/dispatch(.*)",
  "/admin(.*)",
  "/business(.*)",
  "/api/me(.*)",
  "/api/notifications(.*)",
]);

// Host canonicalization (spec: docs/superpowers/specs/2026-07-03-admin-
// subdomain-design.md). Consoles are served from ADMIN_HOST; marketing
// from MARKETING_HOST. Requests from any other host (previews,
// localhost) fall through untouched, so this is inert off-production.
const isConsolePath = createRouteMatcher(["/dispatch(.*)", "/admin(.*)", "/business(.*)"]);
const isAdminHostAllowed = createRouteMatcher([
  "/dispatch(.*)",
  "/admin(.*)",
  "/business(.*)",
  "/console",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/trpc/(.*)",
]);

// 308 (permanent, method-preserving) to the same path+query on the
// other production host. Always https — the targets are the real
// production hosts even when testing locally via Host-header injection.
function crossHostRedirect(req: NextRequest, host: string): NextResponse {
  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.host = host;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host")?.toLowerCase().split(":")[0] ?? "";

  if (host === MARKETING_HOST && isConsolePath(req)) {
    return crossHostRedirect(req, ADMIN_HOST);
  }

  if (host === ADMIN_HOST) {
    if (req.nextUrl.pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/console";
      return NextResponse.redirect(url); // 307 — per-user, not canonical
    }
    if (!isAdminHostAllowed(req)) {
      return crossHostRedirect(req, MARKETING_HOST);
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Forward the current pathname so server components (e.g. SectionNav)
  // can highlight the active link without client JS.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-next-pathname", req.nextUrl.pathname);

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Everything below the host block is byte-identical to the current file — only the imports, the two matchers, `crossHostRedirect`, and the host block are new.

- [ ] **Step 3: Typecheck.**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd apps/web && npm run typecheck
```

Expected: exits 0, no errors.

- [ ] **Step 4: Build and start, then curl the middleware behavior.**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd <repo-root>
npx turbo run build --filter=web
PORT=3100 npm run start --workspace=apps/web &   # note the PID; kill it after Step 5
sleep 3
```

Assertions (each line: `status expected-location`):

```bash
c() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$@"; }
c -H 'Host: www.vf1st.com'   'http://localhost:3100/dispatch/fleet'   # 308 https://admin.vf1st.com/dispatch/fleet
c -H 'Host: www.vf1st.com'   'http://localhost:3100/admin?x=1'        # 308 https://admin.vf1st.com/admin?x=1  (query preserved)
c -H 'Host: www.vf1st.com'   'http://localhost:3100/'                 # 200   (marketing untouched)
c -H 'Host: admin.vf1st.com' 'http://localhost:3100/'                 # 307 …/console
c -H 'Host: admin.vf1st.com' 'http://localhost:3100/not-a-console'    # 308 https://www.vf1st.com/not-a-console
c -H 'Host: admin.vf1st.com' 'http://localhost:3100/sign-in'          # 200
c -H 'Host: admin.vf1st.com' 'http://localhost:3100/dispatch'         # 404   (Clerk protect: anon non-browser)
c                            'http://localhost:3100/'                 # 200   (unknown host no-op)
c                            'http://localhost:3100/dispatch'         # 404   (unknown host: today's behavior)
```

Expected: every line matches its comment. (`/console` 307 target 404s until Task 2 — only the redirect itself is asserted here.)

- [ ] **Step 5: Commit** (kill the `next start` process first).

```bash
git add apps/web/lib/site-config.ts apps/web/middleware.ts
git commit -m "feat(web): host-canonicalize consoles to admin.vf1st.com in middleware

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `/console` role dispatcher page

**Files:**

- Create: `apps/web/app/console/page.tsx`
- Modify: `docs/superpowers/specs/2026-07-03-admin-subdomain-design.md` (one-sentence rationale fix)

**Interfaces:**

- Consumes: `getCurrentUserWithRole(): Promise<{ clerkUserId: string; role: UserRole } | null>` from `@/lib/auth/current-user` (role ∈ `'rider' | 'driver' | 'family' | 'dispatcher' | 'admin'`); `ADMIN_HOST`/`MARKETING_HOST` from Task 1.
- Produces: the `/console` route asserted by Task 3's script and targeted by Task 1's root redirect.

- [ ] **Step 1: Create `apps/web/app/console/page.tsx`:**

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUserWithRole } from "@/lib/auth/current-user";
import { ADMIN_HOST, MARKETING_HOST } from "@/lib/site-config";

export const dynamic = "force-dynamic";

// Role dispatcher for the admin-host root (spec: docs/superpowers/specs/
// 2026-07-03-admin-subdomain-design.md §3). Middleware sends
// admin.vf1st.com/ here; staff fan out to their section, everyone else
// exits to marketing. This page is also the loop-breaker: the section
// layouts redirect('/') on wrong-role, and on the admin host '/' lands
// back here — which never sends a non-staff user into a console section.
export default async function ConsolePage() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "admin") {
    redirect("/admin"); // admins also own /business today
  }
  if (user.role === "dispatcher") {
    redirect("/dispatch");
  }

  // Non-staff (rider/driver/family): exit to marketing. On the admin
  // host a relative '/' would bounce straight back here via the
  // middleware root redirect — use the absolute marketing origin.
  const hdrs = await headers();
  const host = hdrs.get("host")?.toLowerCase().split(":")[0] ?? "";
  redirect(host === ADMIN_HOST ? `https://${MARKETING_HOST}/` : "/");
}
```

- [ ] **Step 2: Fix the spec's rationale sentence.** In `docs/superpowers/specs/2026-07-03-admin-subdomain-design.md` §3, replace:

> Middleware cannot resolve roles (role lives in the DB, not the Clerk JWT), so the admin-host root lands on a tiny server component:

with:

> The role check belongs in the existing `getCurrentUserWithRole()` server helper (Clerk session claims with a `currentUser()` fallback — not guaranteed to be resolvable synchronously in middleware), so the admin-host root lands on a tiny server component:

- [ ] **Step 3: Typecheck.**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd apps/web && npm run typecheck
```

Expected: exits 0.

- [ ] **Step 4: Rebuild, restart, curl the dispatcher.**

```bash
cd <repo-root>
npx turbo run build --filter=web
PORT=3100 npm run start --workspace=apps/web &
sleep 3
c() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$@"; }
c -H 'Host: admin.vf1st.com' 'http://localhost:3100/console'   # 307 …/sign-in  (anonymous)
c                            'http://localhost:3100/console'   # 307 …/sign-in  (any host, anonymous)
```

Expected: both 307 to `/sign-in`. (Role-based fan-out needs a signed-in session — covered by the live manual checks in Task 4.)

- [ ] **Step 5: Commit** (kill `next start` first).

```bash
git add apps/web/app/console/page.tsx docs/superpowers/specs/2026-07-03-admin-subdomain-design.md
git commit -m "feat(web): /console role dispatcher for the admin host

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Committed verification script (full routing matrix)

**Files:**

- Create: `apps/web/scripts/verify-host-routing.sh`

**Interfaces:**

- Consumes: the routing behavior from Tasks 1–2.
- Produces: `verify-host-routing.sh [base-url|live]` — exits 0 when every matrix row passes; used locally here and against production in Task 4.

- [ ] **Step 1: Create `apps/web/scripts/verify-host-routing.sh`:**

```bash
#!/usr/bin/env bash
# Verify the host-canonicalization routing matrix
# (docs/superpowers/specs/2026-07-03-admin-subdomain-design.md).
#
# Local (Host-header injection against next start):
#   ./verify-host-routing.sh http://localhost:3100
# Live (real DNS, run after the admin domain is attached):
#   ./verify-host-routing.sh live
set -u

MODE="${1:-http://localhost:3100}"
FAIL=0

# check <label> <expected-status> <expected-redirect-prefix|-> <curl args...>
check() {
  local label="$1" want_status="$2" want_loc="$3"; shift 3
  local out status loc
  out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$@")
  status="${out%% *}"; loc="${out#* }"
  if [[ "$status" != "$want_status" ]] || { [[ "$want_loc" != "-" ]] && [[ "$loc" != "$want_loc"* ]]; }; then
    echo "FAIL  $label -> got: $out  want: $want_status ${want_loc}"
    FAIL=1
  else
    echo "ok    $label"
  fi
}

# Host headers are always passed explicitly: locally they inject the
# production host against next start; in live mode they match the URL's
# own host (a no-op), which keeps the arrays non-empty — macOS bash 3.2
# errors on empty-array expansion under `set -u`.
if [[ "$MODE" == "live" ]]; then
  WWW=(https://www.vf1st.com)
  ADM=(https://admin.vf1st.com)
else
  WWW=("$MODE")
  ADM=("$MODE")
fi
WWW_H=(-H 'Host: www.vf1st.com')
ADM_H=(-H 'Host: admin.vf1st.com')

# www: console paths canonicalize to the admin host (query preserved)
check "www /dispatch/fleet -> admin" 308 "https://admin.vf1st.com/dispatch/fleet" "${WWW_H[@]}" "${WWW[0]}/dispatch/fleet"
check "www /admin?x=1 keeps query"   308 "https://admin.vf1st.com/admin?x=1"      "${WWW_H[@]}" "${WWW[0]}/admin?x=1"
check "www /business -> admin"       308 "https://admin.vf1st.com/business"       "${WWW_H[@]}" "${WWW[0]}/business"
# www: marketing untouched
check "www / serves marketing"       200 - "${WWW_H[@]}" "${WWW[0]}/"
# admin: root -> role dispatcher; anonymous dispatcher -> sign-in
check "admin / -> /console"          307 "/console"  "${ADM_H[@]}" "${ADM[0]}/"
check "admin /console anon -> sign-in" 307 "/sign-in" "${ADM_H[@]}" "${ADM[0]}/console"
# admin: allowlisted paths serve
check "admin /sign-in serves"        200 - "${ADM_H[@]}" "${ADM[0]}/sign-in"
check "admin /dispatch anon gated"   404 - "${ADM_H[@]}" "${ADM[0]}/dispatch"
# admin: marketing paths bounce to www
check "admin marketing path -> www"  308 "https://www.vf1st.com/not-a-console" "${ADM_H[@]}" "${ADM[0]}/not-a-console"
# /api is served on BOTH hosts, never host-redirected (webhooks/callers
# must not eat a 308). Empty-body POST to the waitlist zod-rejects: 400
# proves the route executed rather than redirected.
check "www /api served (400 zod)"    400 - -X POST -H 'Content-Type: application/json' -d '{}' "${WWW_H[@]}" "${WWW[0]}/api/waitlist"
check "admin /api served (400 zod)"  400 - -X POST -H 'Content-Type: application/json' -d '{}' "${ADM_H[@]}" "${ADM[0]}/api/waitlist"

if [[ "$MODE" != "live" ]]; then
  # unknown host: everything behaves as today (no-op row)
  check "unknown host / serves"        200 - "$MODE/"
  check "unknown host /dispatch gated" 404 - "$MODE/dispatch"
  check "unknown host /console -> sign-in" 307 "/sign-in" "$MODE/console"
fi

exit $FAIL
```

Note: `/console`'s redirect and `/sign-in`'s Location are host-relative in Next's output; asserting the path prefix (`/console`, `/sign-in`) tolerates absolute vs relative Location forms. `chmod +x apps/web/scripts/verify-host-routing.sh`.

- [ ] **Step 2: Run it against the local build.**

```bash
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
cd <repo-root>
PORT=3100 npm run start --workspace=apps/web &
sleep 3
./apps/web/scripts/verify-host-routing.sh http://localhost:3100
```

Expected: every row `ok`, exit 0. If a row fails, fix the middleware/page (Tasks 1–2), rebuild, re-run — do not weaken the assertion.

- [ ] **Step 3: Commit** (kill `next start` first).

```bash
git add apps/web/scripts/verify-host-routing.sh
git commit -m "test(web): committed curl matrix for host-canonicalization routing

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Ship, attach domain, verify live

**Files:** none (PRs, Vercel/DNS operations, live verification).

**Interfaces:**

- Consumes: merged Tasks 1–3; `verify-host-routing.sh live`.
- Produces: `admin.vf1st.com` live in production.

- [ ] **Step 1: Push and open the PR into `dev`.**

```bash
git push -u origin feature/admin-subdomain
gh pr create --base dev --head feature/admin-subdomain \
  --title "feat(web): serve consoles at admin.vf1st.com (host canonicalization)" \
  --body "Implements docs/superpowers/specs/2026-07-03-admin-subdomain-design.md. Middleware host matrix + /console role dispatcher + committed curl verification script. Previews/local unaffected (unknown-host no-op)."
```

Wait for the 5 checks (Lint, Format, Type Check, Test, Build) → green → `gh pr merge <n> --merge`.

- [ ] **Step 2: Promote `dev → stage → main`** (same two-PR flow as the launch, PRs #21/#22 pattern):

```bash
gh pr create --base stage --head dev \
  --title "Promote dev → stage: admin.vf1st.com host routing" \
  --body "Promotes the admin-subdomain host-canonicalization feature. Spec: docs/superpowers/specs/2026-07-03-admin-subdomain-design.md"
# wait for the 5 checks -> green, then:
gh pr merge <n> --merge

gh pr create --base main --head stage \
  --title "Promote stage → main: admin.vf1st.com host routing" \
  --body "Production deploy of the admin-subdomain host routing. Domain attach + DNS follow post-deploy (spec §4 sequencing)."
# wait for the 5 checks -> green, then:
gh pr merge <n> --merge
```

The `main` merge auto-triggers the production deploy; wait for READY (`vercel ls --scope novagen`).

- [ ] **Step 3: Attach the subdomain to the Vercel project** (only after the prod deploy is READY — spec §4 sequencing):

```bash
vercel domains add admin.vf1st.com --scope novagen
```

Expected: domain added to `novagen/veterans-first-app` awaiting DNS.

- [ ] **Step 4 (Wayne, Porkbun):** add one CNAME — host `admin`, target `cname.vercel-dns.com`. Wait for propagation (`dig +short admin.vf1st.com CNAME` shows the target; Vercel dashboard shows the domain valid).

- [ ] **Step 5: Run the live matrix.**

```bash
./apps/web/scripts/verify-host-routing.sh live
```

Expected: all rows `ok`, exit 0.

- [ ] **Step 6: Manual checks (Wayne):**
  - Staff sign-in in a browser at `https://admin.vf1st.com` → lands in the right section (`admin` → `/admin`, `dispatcher` → `/dispatch`).
  - If the sign-in UI errors, check the browser console for Clerk FAPI CORS errors → add `admin.vf1st.com` to the Clerk production instance's allowed origins (spec §4 fallback) and retest.
  - A non-staff account visiting `https://admin.vf1st.com` exits to `https://www.vf1st.com/`.
  - Spot-check a staff bookmark: `https://www.vf1st.com/dispatch` in the signed-in browser → ends on `admin.vf1st.com/dispatch`.
