# Compliance & Completeness Gap Analysis — Console, Admin & Marketing

**Date:** 2026-07-05
**Scope:** apps/web staff console (admin / dispatch / business), apps/web marketing site, and the platform layer (schema, auth, integrations) they sit on. Mobile is covered where it depends on web surfaces (legal URLs, notifications).
**Assumptions (decided 2026-07-05):** phased payer model — private-pay B2C at launch, Medicaid/VA/NEMT-plan billing on the roadmap; multi-state/national market.
**Method:** three parallel code inventories of the repo + the project's own PRD/epics/deferred-findings + a 107-agent deep-research pass in which every legal claim below marked **[verified]** survived 3-of-3 adversarial verification against primary sources (CFR/USC text, HHS/FTC/CMS/VA pages). Items marked **[counsel]** are well-established general guidance that was _not_ primary-source-verified in this pass — confirm with a lawyer.
**This is not legal advice.** It is an engineering-side map of exposure and completeness to bring to counsel.

---

## Executive summary

**The biggest legal risk is not the console — it's the marketing copy.** The site publishes fabricated statistics ("12,000+ rides," "96% on-time"), a fictional testimonial-style persona ("your driver Dave, who's driven you 23 times"), a payer-billing claim that is false today ("We bill Medicaid, VA, and most NEMT plans directly"), and contradictory pricing ("$45 locked" vs "$25 base + $2.50/mile") — all with zero legal pages behind them. Under the FTC's testimonial rule (16 CFR Part 465, effective Oct 2024) and FTC Act §5, this is enforceable exposure **today**, amplified by the veteran-targeting angle (FTC has a $7.5M precedent against veteran-themed marketing implying VA affiliation). These are copy edits and two legal documents — cheap to fix, expensive to ignore.

**The most surprising verified finding:** DOT's ADA transportation rules (49 CFR Part 37) bind a private-pay door-to-door operator **now** — no federal funding, Medicaid, or size threshold required. That means no accessibility surcharges, wheelchair securement + driver assistance duties, and driver training "to proficiency" — with DOJ actively suing ride services (Uber, Sept 2025). The console currently can't even _show_ a dispatcher that a rider uses a wheelchair.

**HIPAA is (probably) not live yet — but you're building as if it is, and incompletely.** Verified bright lines: private-pay card payments alone don't trigger HIPAA; business-associate status attaches at the **first broker/MCO/plan data exchange** and covered-entity status at the **first electronic claim (837P)**. The PRD already commits to HIPAA-grade controls, and several are stubs: PHI read-logging never fires (the HIPAA export is always empty), no MFA/session timeout, PHI replicated in plaintext into `audit_logs` and `notification_logs` with no retention limits.

**Completeness:** every epic is marked done, but nine PRD FRs never shipped in the console (fleet _map_, dispatcher cancel/modify, rider detail/notes/creation, call logging, driver feedback), the money pipeline is dead wiring (invoice/earnings generators have zero callers; Stripe webhook accepts unsigned JSON), and console actions never notify riders or drivers. The marketing site is one page with placeholder phone/footer links and no way to convert beyond a waitlist email.

---

## How to read the priorities

| Tier   | Meaning                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------- |
| **P0** | Legal exposure live today, or trivially cheap protection. Do before any marketing push.        |
| **P1** | Required to actually operate (product completeness + own-PRD commitments). Pre-launch.         |
| **P2** | Roadmap-gated compliance — attaches when Medicaid/VA dollars or partner PHI flow. Build-ahead. |

---

## Part 1 — Marketing site: legal exposure that applies NOW

### 1.1 Advertising claims (P0 — FTC exposure today)

| Claim on site                                                | Location                                       | Problem                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "12,000+ Rides completed", "96% On-time pickups"             | `components/marketing/TrustStrip.tsx:9-12`     | Fabricated statistics presented as fact from a pre-launch company. FTC Act §5 requires substantiation for objective claims. **[verified]** (mechanism; the stats being fake is from code inspection — literals with a "render final" comment)                                                                                                                                  |
| "Your driver Dave, who's driven you 23 times"                | `Differentiators.tsx:38`                       | Reads as a testimonial/track-record; it's invented. The FTC Consumer Reviews and Testimonials Rule (16 CFR Part 465, eff. 2024-10-21) bans fake testimonials; posting them on your own site is "disseminating," not hosting; penalties up to ~$53,088 per knowing violation, no small-business exemption. **[verified]**                                                       |
| "We bill Medicaid, VA, and most NEMT plans directly"         | `PricingFamily.tsx:12`                         | False today — the platform is rider-pays-only; no payer entity exists in the schema. Deceptive under §5, and it's a veteran-audience claim: FTC v. Mortgage Investors Corp. ($7.5M, M.D. Fla. 2013) establishes that veteran-themed marketing implying VA/government affiliation is actionable; the 2024 Impersonation Rule (16 CFR Part 461) strengthens this. **[verified]** |
| "$45 locked. No surge. Ever." vs "$25 base + $2.50 per mile" | `TrustStrip.tsx:11`, `PricingFamily.tsx:10,57` | Internally contradictory price claims — deception risk and a customer-service timebomb. (Config default in `system_config` is metered.)                                                                                                                                                                                                                                        |
| "Background-checked, credentialed, and insured"              | `Differentiators.tsx:11`                       | Only make this claim if credential records substantiate it at launch (see Part 3 — the credential system exists but onboarding doesn't collect all required types).                                                                                                                                                                                                            |

**Fix pattern:** truthful pre-launch copy ("Launching in 2026 — join the waitlist"; goals not stats), one reconciled pricing story, payer claim changed to roadmap phrasing ("Private-pay today; Medicaid/VA billing planned") or removed until true.

### 1.2 VA branding (P0 — keep clean, it currently is)

The logo is a brass star + wordmark; **no VA seal, flag, or colorable imitation is used** — good, keep it that way. Misuse of the VA seal/flag is federal criminal exposure (38 CFR 1.9(f); 18 USC 506/701/1017), independent of billing status. **[verified]** Generic "veterans" branding is outside the seal rule but inside FTC implied-affiliation deception (see 1.1). The existing code-comment guardrail ("say 'many of our drivers are veterans themselves' — do NOT claim veteran-owned", `Differentiators.tsx:4-6`) is exactly right; make it a written copy-review rule. Whether 38 USC 5905 adds anything for marketing is an open question for counsel.

### 1.3 Missing legal pages (P0)

All are **NOT FOUND** on the site today, while it collects emails and makes medical-adjacent claims:

- **Privacy policy** — baseline duty for a commercial site collecting personal info from California residents under CalOPPA (no size threshold); most state comprehensive privacy laws have volume thresholds a pre-launch startup won't hit, but CalOPPA doesn't work that way. **[counsel]** Also concretely blocking: `apps/mobile/app/legal/privacy.tsx:9` renders a dev placeholder unless `EXPO_PUBLIC_PRIVACY_POLICY_URL` is set — **App Store submission requires a live privacy policy URL**, so the missing web page blocks the mobile launch too (same for `EXPO_PUBLIC_TERMS_URL`).
- **Terms of service** — a transportation business with physical risk has no limitation of liability, arbitration/class-waiver decision, cancellation/no-show policy, or service-scope definition anywhere. **[counsel]**
- **Accessibility statement** — expected by plaintiffs' bar and settlement norms; near-zero cost (see 1.4).
- **Refund/cancellation policy, SMS terms (when SMS ships), cookie policy (when analytics ship).**

### 1.4 Web accessibility (P0 posture, ongoing)

ADA Title III website suits hit **3,117 federal filings in 2025, +27% YoY** (Seyfarth tracker, corroborated by UsableNet; NY and FL are the hotspot venues — note FL). Trigger is simply operating a public consumer site. **[verified]** Target **WCAG 2.2 AA**: it's the latest completed standard, backwards-compatible, and subsumes the WCAG 2.1 AA benchmark DOJ pegged and most demand letters cite. **[verified]**

The code-level foundation is genuinely strong (semantic landmarks, labeled forms, focus-visible outlines, reduced-motion handling, disciplined alt text — per inventory). Gaps: **no skip-to-content link**, duplicate `aria-label="Primary"` nav landmarks, contrast watch-items (white/0.7 text on navy; `ink-secondary` on white), no accessibility statement, and **no automated a11y testing** (axe/pa11y in CI, screen-reader smoke pass) to keep it true. A veteran/disability-focused brand will be held to its own standard.

### 1.5 Email & SMS (P0 for the first launch email; design-ahead for SMS)

- **CAN-SPAM attaches at the first launch/announcement email** to the waitlist — no bulk threshold. Every commercial email needs: ad identification (relaxed where the recipient gave prior affirmative consent — arguably the waitlist), **a valid physical postal address**, and a **clear opt-out**; up to ~$53,088 per violating email, and liability attaches to the promoted company even if a vendor sends it. **[verified]** The current Resend confirmation template has none of these footer elements (it's plausibly "transactional," but the launch blast won't be) — and it says "Veterans First" while the site says "Veterans 1st" (`lib/email/resend.ts:26-27`). Action: build the CAN-SPAM footer into the email layer now; get a real postal address.
- **TCPA (before collecting phone numbers / sending SMS):** this research layer produced no surviving verified claims — treat as **open/[counsel]**. Directional notes from the source pool: the FCC's one-to-one consent rule was vacated by the Eleventh Circuit in 2025, but prior-express-written-consent for marketing texts, disclosure at the point of collection, revocation handling, and a 2025 wave of quiet-hours class actions all remain live. Design the future phone field with an unchecked consent checkbox, clear disclosure copy, STOP/HELP handling, and quiet-hours windowing — and have counsel sign off before the first text. TCPA statutory damages ($500–$1,500/message) are the classic class-action vector for exactly this kind of service.
- **Waitlist form hygiene:** honeypot + zod exist, but `/api/waitlist` — the only public unauthenticated write — has **no rate limiting** (the in-memory limiter is only used on `/api/me/role` and is per-instance on Vercel anyway) and no CAPTCHA. Add durable rate limiting (e.g. Upstash) and a privacy-policy link next to the submit button.

### 1.6 Trust & contact basics (P0/P1)

- **Placeholder phone `(919) 555-0100`** ships as the fallback across nav/hero/footer/CTA (`lib/site-config.ts:3`). Set `NEXT_PUBLIC_SUPPORT_PHONE` or fail the build without it.
- **No contact page, support email, or postal address** anywhere (postal address is also a CAN-SPAM prerequisite).
- **Veterans Crisis Line:** add the official block — **"Dial 988 then Press 1," text 838255, chat at VeteransCrisisLine.net** — using VA's free, explicitly-reusable outreach assets (logos, web graphics; use-conditions only, no approval needed; don't roll your own VA-styled imagery). Zero cost, high trust, table stakes for a veteran-serving org. **[verified]**

### 1.7 Cookies/analytics (informational)

Verified: the site ships **zero** analytics/tracking today, so no consent banner is required yet. When PostHog/GA lands, revisit consent gating per then-current state laws **[counsel]** — and note the flip side: you're flying blind (no analytics, no error monitoring) on a conversion surface.

---

## Part 2 — Console & platform: compliance posture

### 2.1 The trigger map (what attaches when) — all **[verified]**

| Event                                                          | What attaches                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Console implication                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today (private-pay B2C)**                                    | **49 CFR Part 37 (DOT ADA)** — applies to private entities "whether or not they receive Federal financial assistance" (37.21(a)); demand-responsive/taxi-style coverage (37.29). Duties: **no accessibility surcharges** (37.5(d)); no refusing riders whose wheelchair "can't be secured satisfactorily"; **provide and use securement systems**; drivers must leave the seat to assist (37.165); **training to proficiency** (37.173). DOJ sued Uber under Title III in Sept 2025 (service animals, wheelchair refusals, surcharges); Uber wait-time-fee settlement ~$2.2M (2022). | Pricing engine must be provably surcharge-free for disability accommodations (flat config is fine — document it). Track per-driver **training records** and per-vehicle **securement equipment**. Add **service-animal policy** + decline-reason categories so refusals are reviewable. Surface rider mobility needs to dispatch (today they're invisible — see 3.3). |
| **HIPAA — not yet**                                            | Neither covered entity nor business associate ⇒ HIPAA Rules don't apply (HHS verbatim). Card payments are exempt from "standard transactions" (SSA §1179).                                                                                                                                                                                                                                                                                                                                                                                                                           | The private-pay launch likely sits **outside HIPAA**. But state privacy/breach laws and the FTC Health Breach Notification Rule can still apply **[counsel]**, and the PRD self-commits to HIPAA-grade controls (below).                                                                                                                                              |
| **First broker/MCO/plan data exchange**                        | **Business associate** status + written **BAA** required (45 CFR 164.502(e)/504(e)); HIPAA Security Rule controls must be real _before_ the first claim.                                                                                                                                                                                                                                                                                                                                                                                                                             | Access logging incl. **reads**, MFA, session timeout, retention, breach-notification process, BAA registry.                                                                                                                                                                                                                                                           |
| **First electronic claim (837P) or 270/271 eligibility check** | **Covered entity** — and then _all_ rider PHI is covered, including private-pay riders.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Full Privacy Rule program: Notice of Privacy Practices, patient-rights workflows, minimum-necessary access.                                                                                                                                                                                                                                                           |
| **Medicaid dollars flow**                                      | **CAA 2021 §209** (SSA 1902(a)(87)) four driver minimums: (A) provider+driver **not on the HHS-OIG exclusion list**, (B) valid driver's license, (C) process for state drug-law violations, (D) process to **disclose driver driving history (MVR)** to the state. Broker subcontracts (42 CFR 440.170(a)(4)) add contractual oversight of rider access, **complaints**, timeliness, and personnel qualification. NEMT is a mandatory benefit in every state, usually broker-mediated — the market is guaranteed, entry is contracted.                                               | Credential schema must grow: OIG-exclusion screening (with recheck cadence), MVR workflow, drug-testing records, vehicle inspections; a **complaints/grievance module** becomes contractual, not optional.                                                                                                                                                            |
| **VA billing**                                                 | No open enrollment exists. Paths: **SAM.gov procurement** at individual VAMCs, or **beneficiary-travel "special mode"** payments — which require **VHA pre-authorization before travel** and vehicles "specially designed" for disabled transport (wheelchair van/ambulette); **sedans cannot qualify**. VTS (38 CFR Part 70 Subpart B) is VA-operated, not joinable.                                                                                                                                                                                                                | Fleet strategy: WAV vehicles are the entry ticket. Console needs a per-trip **VHA authorization number** field + standing-authorization support for recurring series (dialysis-style).                                                                                                                                                                                |

### 2.2 Gaps against the project's own PRD commitments (P1 — you promised these)

The PRD (`_bmad-output/planning-artifacts/prd.md`) declares HIPAA-grade posture and safety features. Current reality:

1. **PHI read-logging is a no-op.** `HIPAA_ACCESS_ACTIONS` (rider_viewed, phi_accessed, rider_search_performed…) are defined (`lib/business/tripDocumentation.ts:62`) but **never emitted anywhere**; DB triggers only fire on writes. `/api/business/compliance/hipaa.csv` is therefore **always empty** — a compliance report that reports nothing. (PRD FR54: "System logs all access to rider personal and medical information"; also flagged in deferred-findings 5-12.)
2. **No MFA enforcement, no session timeout** for staff (PRD: automatic logoff; Clerk MFA unconfigured in-repo; Supabase MFA explicitly disabled but unused). Admin accounts can waive invoices and reset passwords on a password alone.
3. **PHI sprawls into logs with no retention policy.** `audit_logs.old/new_values` store full row snapshots (the audit table is itself a PHI replica); `notification_logs.content` stores rendered message bodies (addresses, photo URLs) as plaintext; `driver_locations` GPS accumulates forever; account deletion is soft-delete-only with server-side cascade explicitly "out of scope" (`delete-account.tsx:13`). PRD commits to app-layer PHI encryption and 6+ year healthcare-aligned retention — neither exists. Decide retention windows, build purge crons, and stop serializing PHI into log tables (structured refs instead of bodies).
4. **Stripe webhook accepts unsigned JSON** (`app/api/webhooks/stripe/route.ts`) — anyone who finds the URL can mark invoices paid. Already rated **High** in deferred-findings 5-5. Verify signatures or disable the route until real Stripe lands (the SDK isn't even installed; charging is `stubbedStripeCharge`).
5. **Reminders "cron" is callable by any signed-in user** (`/api/notifications/reminders` gates on `getCurrentUserId()` only). No `CRON_SECRET` exists in the codebase. Lock to a service token; same for `/api/admin/credential-alerts` (admin-gated but outside the middleware matcher).
6. **Legacy Deno clerk-webhook edge function** (hand-rolled HMAC, `--no-verify-jwt`, hardcodes role rider) still exists alongside the Svix-verified route — confirm decommissioned or delete.
7. **No incident-reporting workflow and no complaints module** — the PRD names incident reporting a _safety-critical feature_; complaints become contractual under Medicaid brokerage. Neither table nor UI exists.
8. **No panic button** (PRD safety-critical list) anywhere in the rider app.
9. **Driver credential schema is 4 types** (license, insurance, background check, vehicle registration) — missing **drug testing, MVR/driving record, vehicle inspection, training certs** (the PRD's own NC table + CAA §209 + Part 37 training all require them). The onboarding form doesn't even collect `vehicle_registration` or background-check expiry.
10. **Onboarding intake doesn't persist.** The mobile veteran-status step (branch, service status, DD-214 upload) ends in `console.log` (`(auth)/onboarding/terms.tsx:23-24` TODO) — no schema columns exist for veteran/eligibility data at all, and **terms acceptance isn't recorded** (you can't prove a rider ever accepted terms — an enforceability problem once ToS exist).
11. **No error monitoring or product analytics** anywhere (logger is a console.log shim) — you cannot detect a breach, an outage, or a stuck booking funnel. PRD's observability section promises otherwise.
12. **Dispatch server actions lack defense-in-depth:** no per-action role re-check (layout + RLS only) and they fail **silently** (return void on error) — a dispatcher can "assign" a ride and never learn it failed.

### 2.3 Platform security odds-and-ends (P1)

- In-memory rate limiter is per-instance (ineffective on Vercel) and only guards one authed route; the public waitlist has none.
- Google Maps/Places keys ship in the mobile bundle (`EXPO_PUBLIC_*`) — restrict by bundle ID/API at the provider.
- No CSP header (deliberately deferred in `next.config.ts` — revisit before launch).
- `system_config` RLS is world-readable to authenticated users (probably fine for pricing/hours; confirm intent).

---

## Part 3 — Console completeness (product gaps)

### 3.1 PRD-promised, epic marked "done," never shipped (P1)

| FR      | Promise                                                  | Reality                                                                                                      |
| ------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| FR31    | Real-time **map** of active drivers                      | `/dispatch/fleet` renders GPS as **lat/lng text**; "map SDK deferred"                                        |
| FR37    | Dispatchers **modify or cancel** rides                   | No cancel/modify action exists anywhere in the console                                                       |
| FR39    | Rider **profile view** (contact, addresses, preferences) | No rider detail page; list shows name/phone/email only                                                       |
| FR40    | **Notes on rider profiles**                              | Nowhere to view or add                                                                                       |
| FR41    | Dispatchers **create rider accounts**                    | Not possible from console                                                                                    |
| FR45/46 | **Call logging** + caller-ID lookup for phone bookings   | Phone-booking form exists; no call log, no caller-ID; the form's "referral source" field is silently dropped |
| FR30    | Driver **performance metrics & rider feedback**          | No ratings/feedback system anywhere (no schema, no UI)                                                       |
| FR8     | **Automated** confirmation calls                         | Manual dispatcher checklist instead (fine for MVP — but it's labeled done)                                   |
| FR53    | No-show **history per rider**                            | Events exist; never surfaced per-rider                                                                       |

### 3.2 Dead wiring — features that exist but never run (P1, mostly known in deferred-findings)

- `generateInvoiceForRide` and `recordEarningsForRide` have **zero callers** — no invoice or earning is ever created by the app; every billing/payroll screen is empty unless seeded. The consolidation cron is written but never scheduled. (deferred-findings 5-4/5-6)
- **Console actions never notify anyone.** Assign/reassign, phone-booking creation, confirmation, and no-show reopen do bare DB updates; `/api/notifications/*` is never called from console code — riders and drivers are not told when dispatch changes their world. (deferred-findings 4-8 anticipated exactly this.)
- Invoice detail has **no actions** (no generate, send, mark-paid, refund, PDF); "paid" can only be set by the unverified Stripe webhook.
- `lib/flags.ts` and `pointInServiceArea`/`computeRideFareCents`/`isWithinOperatingHours` are exported but unwired into booking (deferred 5-13/5-14) — the admin's service-area/pricing/hours configuration **doesn't actually constrain bookings**.

### 3.3 The rider-safety visibility hole (P1 — also a Part 37 risk)

The schema holds `rider_preferences.mobility_aid` (incl. power wheelchair), door/package assistance, extra-space, special-equipment notes, and emergency contacts — and **no console screen displays any of it**. A dispatcher can assign a power-wheelchair rider to a sedan with no warning, and staff can't retrieve an emergency contact during an incident. The single highest-leverage console build: a **rider detail page** (mobility needs, emergency contact, notes, flags, no-show history, ride history, upcoming rides) linked from every rider reference.

### 3.4 Missing modules a real NEMT ops console has (P1→P2)

Regulatory-derived minima are **[verified]** above (credential expansion, complaints, training/securement records, VHA auth field). The commercial platform benchmark (RouteGenie/MediRoutes/Momentm/Bambi/ModivCare class) didn't survive verification this pass — treat the following as industry-standard patterns **[benchmark]**:

- **Unified ride detail page** (status timeline, events, GPS trail, actions) — today a ride is only ever a table row.
- **Standing orders / recurring trips management** (recurring booking exists rider-side; dispatch can't see or manage series).
- **Incident reports** + **complaints/grievances** queues with statuses and outcomes.
- **Message center**: send SMS/push to a rider/driver from the console, templates, and a `notification_logs` viewer (the data is already written; nobody can read it).
- **Audit log viewer** (admin) — currently CSV-export-only.
- **Driver shifts/availability visibility** for dispatch (table exists, mobile-managed, invisible in console) + a real "on shift now" board.
- **Vehicle registry** separate from driver profile, with inspection records.
- **Billing operations**: generate/send/mark-paid/refund, invoice PDF, reconciliation view.
- **Payer/claims module** (P2): organization/broker/payer entities, trip-to-authorization linkage, 837P export, remittance tracking — the schema currently has _no third-party payer concept at all_, which is the single biggest build for the roadmap model.

### 3.5 Console platform hygiene (P1)

- **No sign-out or identity chrome** inside admin/dispatch/business (only on the roleless landing state).
- **No pagination anywhere** (hard caps: 100/100/100/200; credentials/earnings uncapped).
- **Errors render as empty states** (fetch try/catch → `[]`), and there are **no `loading.tsx`/`error.tsx`/`not-found.tsx`** files at all.
- No staff **deactivation** (only drivers); no bulk operations; exports are CSV-only.
- MFA (see 2.2) and an idle-timeout banner belong in this chrome work too.

---

## Part 4 — Marketing completeness (beyond the legal minimums)

**Pages/sections that don't exist** (single-page site today; footer self-describes its links as placeholders, `MarketingFooter.tsx:5`):

- **Contact page** (real phone, support email, postal address, hours) — also the CAN-SPAM address prerequisite.
- **Drive-for-us / driver recruiting page** — the supply side has no funnel at all; every transport service runs one.
- **For-families page** (they're a named persona and a mobile app role; today it's one card + an anchor).
- **Service-area page** ("the Triangle and beyond" is the only geography statement; reconcile with actual launch market).
- **FAQ**, **About/team** (trust surface for adult children choosing transport for a parent), **real testimonials** (with written consent + Part 465 compliance), **partners** (VSOs, clinics — post-BAA for anything PHI), **blog/resources** (SEO).
- **App download** links when live (the honest "Coming soon" pills are good for now; `StoreBadges.tsx` is dead code — delete or wire).

**Technical SEO/infra, all currently missing:** `sitemap.ts`, `robots.ts`, Open Graph/Twitter metadata + `metadataBase`, canonical tags, JSON-LD (`LocalBusiness`), favicon wiring (`metadata.icons` — icons exist on disk but are never declared), web manifest, custom `not-found.tsx`, analytics (consent-gated) + error monitoring, durable rate limiting on the waitlist.

**Copy/ops fixes:** placeholder 555 phone; footer "Our drivers" mis-targets `#how-it-works`; "Contact us" is a bare `tel:`; launch-email automation is a no-op until `RESEND_API_KEY`/`WAITLIST_FROM_EMAIL` are set (the on-page promise "we'll email you the day we launch" is currently manual); "Veterans First" vs "Veterans 1st" brand inconsistency.

---

## Part 5 — Prioritized action plan

### P0 — this week, before any traffic push (mostly copy + 2 documents + 3 small patches)

1. **Strike the fabricated/false claims**: 12,000+/96% stats, "Dave ×23," Medicaid/VA billing line, "$45 locked" vs metered contradiction. Replace with truthful pre-launch copy.
2. **Publish privacy policy + terms of service** (counsel-drafted); link in footer + next to the waitlist submit; set `EXPO_PUBLIC_PRIVACY_POLICY_URL`/`EXPO_PUBLIC_TERMS_URL` so the mobile screens stop rendering placeholders.
3. **Accessibility**: publish an accessibility statement, add the skip link, fix duplicate nav landmark labels, adopt WCAG 2.2 AA as the standard, add axe/pa11y to CI.
4. **Kill the unsigned Stripe webhook** (verify signatures or 404 it until Stripe is real) and **lock the reminders cron** behind a `CRON_SECRET`; confirm the legacy Deno clerk-webhook is decommissioned.
5. **Veterans Crisis Line footer block** ("Dial 988 then Press 1" / text 838255) using VA's official free assets.
6. **Real support phone** via env (fail build if unset); rate-limit `/api/waitlist`.

### P1 — pre-launch (product completeness + self-declared compliance)

7. **Rider detail page** in dispatch: mobility/accessibility needs, emergency contact, notes, flags, no-show + ride history. (Closes FR39/40 and the Part 37 visibility hole.)
8. **Ride lifecycle from console**: unified ride detail, cancel/modify (FR37), and **wire console actions to notifications** (assign/confirm/cancel → rider/driver messages) once transports are real; wire Twilio/Expo Push (deferred 4-6).
9. **Turn the money on**: call `generateInvoiceForRide`/`recordEarningsForRide` on completion, schedule the consolidation + uninvoiced-sweep crons, add invoice actions (generate/send/mark-paid/refund + PDF), then real Stripe with signed webhooks.
10. **Staff account hardening**: enforce Clerk MFA for admin/dispatcher, session timeout/auto-logoff, staff deactivation, sign-out/identity chrome in the console.
11. **Make the HIPAA export real**: emit PHI read/search audit events from dispatch/admin rider views (the taxonomy already exists), add an admin audit-log viewer.
12. **Incident + complaint modules** (tables, queues, statuses, reporting) — PRD safety-critical now, broker-contractual later.
13. **Credential schema expansion**: drug testing, MVR, vehicle inspection, training certs; collect vehicle registration + background-check expiry in onboarding; add OIG-exclusion screening workflow with recheck cadence (CAA §209 readiness).
14. **Persist mobile onboarding** (veteran status, address, emergency contact, **terms acceptance with timestamp**); add schema columns or drop the questions.
15. **Observability + data hygiene**: Sentry (web+mobile), consent-gated analytics, retention/purge jobs for `driver_locations`/`notification_logs`/`audit_logs`, stop writing PHI bodies into logs, durable rate limiting, CSP.
16. Marketing completeness build-out: contact page, drive-for-us, FAQ, service area, about, SEO pack (sitemap/robots/OG/JSON-LD/favicons/404), wire Resend launch email with CAN-SPAM footer.

### P2 — payer-readiness (build when the roadmap firms up, before signing anything)

17. **Payer data model**: organization/broker/payer entities, coverage/authorization on rides (incl. VHA pre-auth number + standing authorizations), 837P claim export, remittance/denial tracking.
18. **BAA program**: registry of BAAs, HIPAA Security Rule risk assessment, breach-notification runbook (60-day clock), Notice of Privacy Practices, minimum-necessary role reviews.
19. **WAV fleet support**: vehicle accessibility attributes, securement equipment tracking, WAV-aware assignment (VA special-mode requires specially designed vehicles — sedans can't qualify).
20. **TCPA consent architecture** before any SMS marketing (express written consent capture, revocation, quiet hours) — counsel sign-off.
21. State-by-state licensing/insurance matrix for the actual launch states (open research item).

---

## Open questions (research layers with no verified findings — take to counsel/next research pass)

1. TCPA/SMS consent architecture as of 2026 (post-vacatur standard, revocation rules, quiet hours, point-of-collection disclosures).
2. State layer for actual launch states: comprehensive privacy statutes + thresholds, for-hire/NEMT licensing + insurance minimums, background-check/drug-test/inspection rules above the CAA §209 floor, breach-notification specifics.
3. Commercial NEMT platform feature-parity checklist (RouteGenie/MediRoutes/Momentm/Bambi/WellRyde/ModivCare) — Section C benchmark; the [benchmark] items in 3.4 are directional.
4. Record-retention periods once Medicaid/VA billing begins; whether 38 USC 5905 adds marketing exposure beyond the seal rules.

## Verified-source index (primary sources; every [verified] claim survived 3/3 adversarial checks)

- Seyfarth ADA Title III tracker 2026-03-25 (adatitleiii.com) — 3,117 federal web-accessibility suits in 2025 (+27%); corroborated by UsableNet.
- W3C WAI / WCAG 2.2 (w3.org) — latest-version guidance + backwards compatibility; DOJ peg WCAG 2.1 AA (28 CFR 35.200).
- FTC Consumer Reviews & Testimonials Rule Q&A + 16 CFR 465.2 — own-site testimonials = dissemination; ~$53,088/knowing violation.
- FTC CAN-SPAM Compliance Guide + 15 USC 7702/7704 — per-email penalties; footer requirements; no B2B/bulk exception.
- 38 CFR 1.9(f) + 18 USC 506/701/1017 — VA seal/flag criminal exposure.
- FTC v. Mortgage Investors Corp. (M.D. Fla. 2013; FTC congressional statement) — $7.5M implied-VA-affiliation precedent; 16 CFR Part 461 (2024).
- VeteransCrisisLine.net/spread-the-word — official contacts ("Dial 988 then Press 1"; text 838255) + free reusable assets.
- 49 CFR Part 37 (37.5, 37.21, 37.29, 37.165, 37.173) — private-entity ADA duties; DOJ v. Uber (Sept 2025).
- HHS OCR covered-entities guidance + 45 CFR 160.102/160.103/164.502(e)/164.504(e) — HIPAA trigger analysis; SSA §1179 payment-card exemption.
- CMS SMD 23-006 (Sept 2023) + 42 CFR 431.53/440.170 + SSA 1902(a)(70)/(a)(87) — NEMT assurance, broker rules, CAA §209 driver minimums.
- 38 CFR Part 70 (70.2, 70.4(d), 70.70-73) + 38 USC 111(b)(3)(A) — VA beneficiary travel/special mode; VTS is VA-operated.
