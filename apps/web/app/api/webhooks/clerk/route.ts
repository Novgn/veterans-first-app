// Clerk webhook handler for user lifecycle sync.
//
// Replaces the Deno edge function previously at
// supabase/functions/clerk-webhook/. Handles:
//   - user.created: insert a `users` row (default role 'rider')
//   - user.updated: refresh phone/email/name on the existing row
//   - user.deleted: soft-delete (set users.deleted_at)
//
// Configure the webhook in the Clerk dashboard with:
//   URL:    https://<your-domain>/api/webhooks/clerk
//   Events: user.created, user.updated, user.deleted
//   Secret: copy into CLERK_WEBHOOK_SECRET (server-side env)
//
// Signature verification uses Svix (Clerk's signing library).

import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { getDb, softDeleteUser, upsertUser } from '@veterans-first/shared/db';
import { resolveWebhookRole } from '@veterans-first/shared/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ClerkUser {
  id: string;
  phone_numbers: Array<{ phone_number: string; id: string }>;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name: string | null;
  last_name: string | null;
  public_metadata?: Record<string, unknown>;
  created_at: number;
  updated_at: number;
  image_url?: string;
}

interface WebhookEvent {
  type: string;
  data: ClerkUser;
  object: string;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const payload = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    const svix = new Webhook(webhookSecret);
    event = svix.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { id, phone_numbers, email_addresses, first_name, last_name, public_metadata } =
          event.data;
        // Mirror Clerk's public_metadata.role (set by invitations and the
        // admin console) into the canonical users table. When the payload
        // has no valid role, pass none: upsertUser then defaults new rows
        // to 'rider' and leaves existing rows' role untouched — a plain
        // profile update must never stomp a role assigned elsewhere.
        const role = resolveWebhookRole(public_metadata);
        await upsertUser(db, {
          clerkId: id,
          // null, not '' — users.phone is UNIQUE, and staff (Google/email
          // auth) have no phone; a '' sentinel collides on the second one.
          phone: phone_numbers?.[0]?.phone_number ?? null,
          email: email_addresses?.[0]?.email_address ?? null,
          firstName: first_name ?? '',
          lastName: last_name ?? '',
          ...(role ? { role } : {}),
        });
        return NextResponse.json({ success: true, event_type: event.type });
      }

      case 'user.deleted': {
        await softDeleteUser(db, event.data.id);
        return NextResponse.json({ success: true, event_type: event.type });
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ success: true, event_type: event.type, handled: false });
    }
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
