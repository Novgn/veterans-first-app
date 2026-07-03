# Admin Subdomain (`admin.vf1st.com`) Host Routing — Design

**Date:** 2026-07-03
**Status:** Approved (brainstorm 2026-07-03; scope, www behavior, timing, and approach chosen by Wayne)
**Ships:** first feature cycle after the 2026-07-03 production launch verification (`feature/admin-subdomain → dev → stage → main`)

## Goal

Serve every staff/ops console section at **`admin.vf1st.com`** and make **`www.vf1st.com` a pure marketing site**. All three gated sections move: `/admin`, `/dispatch`, and `/business`. Old console URLs on `www` permanently redirect to the same path on the admin host, so staff bookmarks keep working.

This completes the marketing/console separation rule (marketing = customers only; consoles = staff only) at the _host_ level, on top of the existing app-level separation.

## Non-goals

- No separate Vercel project or second deployment (rejected Approach B — double builds/env drift for separation we don't need yet).
- No Clerk changes: same production instance, no satellite domains. Clerk production cookies are scoped to the root domain `vf1st.com` and span both subdomains.
- No URL-shape changes: paths keep their section prefixes (`admin.vf1st.com/dispatch/fleet`), so every internal absolute link, `redirect()`, and role check works unchanged.
- No changes to the three section layouts' auth/role checks.
- Host routing is **UX canonicalization, not a security boundary** — authentication/authorization remains entirely Clerk middleware + the role-checking layouts, identical on every host.

## Approach (chosen: A — host routing in the existing app)

One Next.js app, one deploy. `apps/web/middleware.ts` canonicalizes by request host ahead of the existing Clerk logic. Two new host constants; one new role-dispatcher page; one extra Vercel production domain; one Porkbun CNAME.

## Routing matrix

Console paths = `/admin`, `/dispatch`, `/business` (and their subpaths).
Admin-host allowlist = console paths + `/console`, `/sign-in`, `/sign-up`, `/api/*`, `/trpc/*`.

| Host                                                 | Path                            | Behavior                                                      |
| ---------------------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| `www.vf1st.com`                                      | console path                    | **308** → `https://admin.vf1st.com` same path + query         |
| `www.vf1st.com`                                      | anything else                   | serve as today (marketing, waitlist API, auth pages)          |
| `admin.vf1st.com`                                    | `/`                             | redirect → `/console` (role dispatcher)                       |
| `admin.vf1st.com`                                    | allowlisted path                | serve normally (Clerk gate unchanged)                         |
| `admin.vf1st.com`                                    | anything else (marketing paths) | **308** → `https://www.vf1st.com` same path + query           |
| any other host (previews, localhost, `*.vercel.app`) | anything                        | **host logic no-ops entirely** — app behaves exactly as today |

The last row is the safety hinge: preview deploys, CI, and `next dev` never match either production host, so nothing changes off-production.

308 (permanent, method-preserving) for both host-canonicalization directions; query strings always preserved. The role dispatcher and its onward hops use Next.js `redirect()` (307) since they're per-user decisions, not canonical facts.

## Components

### 1. Host constants — `apps/web/lib/site-config.ts` (modify)

```ts
export const MARKETING_HOST = "www.vf1st.com";
export const ADMIN_HOST = "admin.vf1st.com";
```

Plain constants alongside the existing `SUPPORT_PHONE` config (no env override — YAGNI; the no-op-on-unknown-hosts rule already keeps previews/local safe). Module stays edge-runtime-safe (plain strings) since middleware imports it.

### 2. Host canonicalization — `apps/web/middleware.ts` (modify, ~30 lines)

Inside the existing `clerkMiddleware` callback, **before** `auth.protect()`:

1. Read the request host (`req.nextUrl.host` / `host` header, lowercased, port ignored).
2. If host is `MARKETING_HOST` and path matches a console prefix → `NextResponse.redirect` 308 to `ADMIN_HOST` + same path/query.
3. If host is `ADMIN_HOST`:
   - `/` → redirect to `/console`;
   - path on the allowlist → fall through to the existing logic;
   - otherwise → 308 to `MARKETING_HOST` + same path/query.
4. Any other host → fall through untouched.

The existing behavior is preserved on every fall-through: `auth.protect()` on protected routes and the `x-next-pathname` header forwarding. The existing `config.matcher` already covers all non-static paths — no matcher change.

### 3. Role dispatcher — `apps/web/app/console/page.tsx` (rewrite of the existing post-sign-in router)

The role check belongs in the existing `getCurrentUserWithRole()` server helper (Clerk session claims with a `currentUser()` fallback — not guaranteed to be resolvable synchronously in middleware), so the admin-host root lands on a tiny server component:

- No Clerk session → `redirect('/sign-in')`. A signed-in user with no resolvable role takes the marketing exit with the other non-staff cases — sending them to /sign-in would loop, since Clerk's sign-in page auto-returns authenticated visitors via `fallbackRedirectUrl="/console"`.
- `role === 'admin'` → `redirect('/admin')` (admins also own `/business` today; the business layout is admin-only until a dedicated role exists).
- `role === 'dispatcher'` → `redirect('/dispatch')`.
- Any other role (`rider`, `driver`, `family`) or no row → send to the marketing site. **Host-aware:** read the request host via `headers()`; on `ADMIN_HOST` redirect to the absolute `https://www.vf1st.com/` (a relative `/` would bounce back into `/console` — infinite loop); on any other host redirect to relative `/`.

This page also breaks the pre-existing loop hazard: the section layouts do `redirect('/')` on wrong-role. On the admin host, `/` → `/console` → off-host for non-staff — never back into a console section.

`/console` also exists on `www` (harmless): a staff member landing there hops relative → `www` console path → 308 → admin host. Anonymous users get `/sign-in`.

### 4. Infra (sequenced)

1. Code merges and deploys to production first (`feature → dev → stage → main`).
2. **Then** add `admin.vf1st.com` as a production domain on the Vercel project (CLI: `vercel domains` / project settings — agent-executable). Sequencing matters: the subdomain must never serve the un-canonicalized app (which would duplicate the marketing site).
3. Porkbun (Wayne): one CNAME — `admin` → `cname.vercel-dns.com`.
4. Clerk: expected zero change. Post-deploy verification includes a real staff sign-in on `admin.vf1st.com`; the one known fallback is adding `admin.vf1st.com` to the Clerk instance's allowed origins if the browser console shows FAPI CORS errors.

## Error handling

- **Unknown/spoofed hosts:** fall through to today's behavior (no redirect loops possible; Vercel only routes configured domains to the project anyway).
- **Signed-in non-staff on admin host:** `/console` exits them to marketing; deep links to console paths still hit the layouts' role checks (`redirect('/')` → `/console` → marketing). Two hops, no loop.
- **`/api/*` on the admin host:** allowlisted and untouched — webhook and notification routes must not be host-redirected (a 308 would break callers). Clerk's webhook stays pointed at `www.vf1st.com/api/webhooks/clerk`; both hosts serve it identically.
- **Redirect-loop guard in review:** every redirect target in the matrix terminates in a served page or an off-host redirect; no cycle exists by construction (verify in the test matrix).

## Testing

No web test harness exists (hard rule — no vitest in `apps/web`). Verification is behavioral:

**Local (pre-merge):** production build (`DATABASE_URL` placeholder) + `next start`, then a `curl` matrix using Host-header injection — middleware sees the `Host` header, so both hosts are testable on localhost:

```bash
curl -sI -H "Host: www.vf1st.com"   localhost:3000/dispatch/fleet   # → 308 admin.vf1st.com/dispatch/fleet
curl -sI -H "Host: admin.vf1st.com" localhost:3000/pricing          # → 308 www.vf1st.com/pricing
curl -sI -H "Host: admin.vf1st.com" localhost:3000/                 # → 307 /console
curl -sI -H "Host: admin.vf1st.com" localhost:3000/sign-in          # → 200
curl -sI                            localhost:3000/                 # unknown host → marketing 200 (no-op row)
```

Every row of the routing matrix gets a curl assertion, including query-string preservation and `/api` pass-through on both hosts.

**Live (post-deploy + domain add):** same matrix against the real hosts, plus the two human checks — staff browser sign-in on `admin.vf1st.com`, and one wrong-role account confirming the exit-to-marketing path.

**Previews/CI:** unaffected by design (no-op row); CI's 5 checks must stay green — the middleware change is exercised by Build/Type Check only.

## Rollout & rollback

- Ship: `feature/admin-subdomain → dev → stage → main` (protected PRs, 5 checks each).
- Rollback: revert the PR (restores www-serves-consoles) but **keep the Vercel domain attached** — browsers cache 308s, so staff who already followed `www → admin` redirects will keep landing on `admin.vf1st.com`; with the domain still attached, the reverted app serves the consoles there too, so nothing breaks. Remove the domain only if the feature is permanently abandoned and the cached redirects have aged out.

## Estimated diff

~30 lines `middleware.ts`, ~25-line `app/console/page.tsx`, 2 constants in `site-config.ts`, no dependency changes.
