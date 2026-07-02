import 'server-only';

import { Resend } from 'resend';

import { log } from '@/lib/logger';

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
    log.info({ event: 'waitlist.email.skipped' }, 'resend not configured; skipping confirmation');
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "You're on the list — Veterans First",
      text: "Thanks for joining the Veterans First waitlist. We'll email you the moment the app is available to ride.",
    });
    if (error) {
      // Resend v6 resolves { data, error } instead of throwing on API-level
      // failures (bad key, unverified domain, rate limit, quota). Log only the
      // error name/type — never the recipient address (PII).
      log.error(
        { event: 'waitlist.email.error', name: error.name },
        'waitlist confirmation failed',
      );
      return;
    }
    log.info({ event: 'waitlist.email.sent' }, 'waitlist confirmation sent');
  } catch (err) {
    log.error(
      { event: 'waitlist.email.error', err: err instanceof Error ? err.message : String(err) },
      'waitlist confirmation failed',
    );
  }
}
