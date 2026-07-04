# Demo data seed

Populates a realistic, self-contained demo dataset for the web consoles
(`/admin`, `/dispatch`, `/business`) so every page has something to show —
driver roster + credential alerts, ride queues (assignments, confirmations,
fleet, no-shows, trip logs), and billing (invoices, payments, driver
earnings).

> **WARNING — writes real rows.** `seed.mjs` performs real `INSERT`/`UPDATE`
> statements against whatever database `DATABASE_URL` points at. Running it
> against a production database will create real demo rows there. Always
> double-check `DATABASE_URL` before running. Production runs are performed
> by the coordinator after review — this PR is local-verification only.

## What it seeds

- **8 riders** — `users` rows (`role = 'rider'`), unique fake phones, a mix
  with emergency contacts (`users.emergency_contact_*`) and two with
  accessibility preferences (`rider_preferences`: power wheelchair / cane).
- **4 drivers** — `users` + `driver_profiles` (vehicle info; 3 active, 1
  inactive) + `driver_credentials` (license/insurance/background
  check/registration). Mostly verified; **one driver's insurance expires
  within 30 days**, **one driver's license is already expired** — this
  lights up the `/admin/credentials` alert banner and the admin dashboard
  badge.
- **~67 rides** spanning the last 6 months (front-loaded so the current
  month is heaviest), plus near-term/today rides:
  - Majority `completed`, fare $18–$45, each with an `arrived` `ride_events`
    row a few minutes off the scheduled pickup time (feeds pickup-timing
    metrics). A minority `cancelled`.
  - 3 `pending` rides several days out (assignments queue).
  - 2 `assigned` + 1 `en_route` today (fleet / assignments queues), with
    `driver_locations` GPS fixes for those drivers.
  - 2 `no_show` rides with `ride_events` notes (no-show queue).
  - 3 `pending` rides scheduled tomorrow (confirmations queue, next 24h).
  - 12 dedicated completed rides (2 per active driver × 2 pay periods) that
    anchor `driver_earnings` for the current and previous weekly pay
    period.
- **Billing** — 3 invoices (`per_ride`): one `paid` (+ a `succeeded`
  `payments` row), one `pending` (+ a `pending` payment attempt), one
  `overdue` (+ a `failed` payment attempt). Each has one
  `invoice_line_items` row tied to its completed ride.
  `rider_payment_accounts` rows for the 3 billing riders.
- **`driver_earnings`** — current + previous pay-period rows for the 3
  active drivers (previous period paid out, current period pending).

Skipped on purpose: no `notification_preferences`, `notification_logs`,
`system_config`, `waitlist`, or `family_links` rows — not needed to light up
the console pages this seed targets.

## Demo-marker convention (hard rule)

Every seeded `users` row has `clerk_id` prefixed `demo_` (e.g.
`demo_rider_01`, `demo_driver_01`) and an email like
`rider01@demo.vf1st.com` / `driver01@demo.vf1st.com`. Every child row
(rides, credentials, invoices, etc.) is reachable from one of those users
via a foreign key, so `teardown.mjs` can find and remove exactly this
dataset — nothing else — by matching `clerk_id LIKE 'demo_%'` and cascading
outward.

**No demo staff.** Admin/dispatcher users are never created here — the
`/admin/users` page's row actions call the real Clerk API with `clerk_id`
and would 500 against a fake identity.

## Running

Both scripts are plain Node ESM, connect via `DATABASE_URL` using the
`postgres` package (`{ prepare: false, max: 1 }`, safe for both a direct
connection and a pgbouncer/Supabase pooler), and require Node 20+.

### Local Supabase

```bash
supabase start   # if not already running
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
  node scripts/demo-seed/seed.mjs
```

Safe to re-run — it's idempotent. Users are upserted on the `clerk_id`
unique key (stable ids across runs); everything else the demo owns is
deleted and re-inserted fresh on every run, so running it N times leaves
the same row counts as running it once.

To remove the demo dataset entirely:

```bash
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
  node scripts/demo-seed/teardown.mjs
```

### Production

Same commands, pointed at the production connection string instead:

```bash
DATABASE_URL='<production DATABASE_URL>' node scripts/demo-seed/seed.mjs
DATABASE_URL='<production DATABASE_URL>' node scripts/demo-seed/teardown.mjs
```

Re-read the warning above before doing this. Confirm `DATABASE_URL` is what
you think it is (`echo $DATABASE_URL` first) — there is no interactive
confirmation prompt in either script.

## Verifying

```sql
-- Row counts
select 'users' t, count(*) from users where clerk_id like 'demo_%'
union all select 'rides', count(*) from rides where rider_id in (select id from users where clerk_id like 'demo_%')
union all select 'invoices', count(*) from invoices where rider_id in (select id from users where clerk_id like 'demo_%');

-- No orphans: every demo ride's rider/driver is a demo user
select count(*) from rides r
where r.rider_id in (select id from users where clerk_id like 'demo_%')
  and r.driver_id is not null
  and r.driver_id not in (select id from users where clerk_id like 'demo_%');
```
