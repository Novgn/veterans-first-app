-- Marketing waitlist — public "Be first to ride" email capture on the
-- marketing site, collected before the mobile app launches. Anonymous
-- pre-launch leads (not tied to a users row). Email is unique + lowercased
-- in the app so repeat submits are idempotent.
--
-- RLS is enabled with NO anon/authenticated policies: the table is written
-- only by the server (Drizzle direct connection / service role), so the
-- captured email list is never exposed to the public anon key.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'marketing-get-the-app',
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

comment on table public.waitlist is 'Public marketing "Be first to ride" email capture (pre-launch leads, not tied to a user). Server-only access via service role / direct connection; RLS denies anon & authenticated so the captured email list stays private.';
