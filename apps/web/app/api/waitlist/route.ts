// Public marketing waitlist endpoint — "Be first to ride" email capture on
// the marketing site, for collecting interest before the mobile app launches.
//
// This is the ONLY public, unauthenticated POST on the site (middleware does
// not protect /api/waitlist). Defenses: strict zod validation, a honeypot
// field, and idempotent handling of duplicate emails (the table's unique
// constraint -> we treat 23505 as success) so repeat submits never error or
// leak whether an address already exists. We never log the email (PII).
//
// Insert goes through the Supabase service-role client (HTTP / PostgREST)
// rather than the Drizzle/postgres.js pooler connection: it's resilient on
// serverless and bypasses RLS, so the `waitlist` table can keep RLS on with no
// public policies. The captured list stays server-only.
//
// NOTE: Resend is now wired for the confirmation email (see
// lib/email/resend.ts), but it no-ops until RESEND_API_KEY and
// WAITLIST_FROM_EMAIL are set — until then this remains persist-only and
// the "we'll email you at launch" promise stays an operational commitment
// (export the list and send when the app ships).

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendWaitlistConfirmation } from '@/lib/email/resend';
import { getServiceRoleSupabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  // Honeypot: a real human leaves this empty; bots tend to fill every field.
  company: z.string().max(200).optional(),
  source: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const { company } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const source = parsed.data.source ?? 'marketing-get-the-app';

  // Honeypot tripped — pretend success so the bot moves on, but write nothing.
  if (company && company.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = getServiceRoleSupabase();
    const { error } = await supabase.from('waitlist').insert({ email, source });

    if (error) {
      // 23505 = unique_violation: already on the list. Idempotent success.
      if (error.code === '23505') {
        return NextResponse.json({ ok: true });
      }
      log.error(
        { event: 'waitlist.error', code: error.code, err: error.message },
        'waitlist insert failed',
      );
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 },
      );
    }

    // Deliberately do NOT log the email address (PII).
    log.info({ event: 'waitlist.signup', source }, 'waitlist signup');
    await sendWaitlistConfirmation(email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error(
      { event: 'waitlist.error', err: err instanceof Error ? err.message : String(err) },
      'waitlist insert failed',
    );
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
