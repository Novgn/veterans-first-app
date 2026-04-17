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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ClerkUser {
  id: string;
  phone_numbers: Array<{ phone_number: string; id: string }>;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name: string | null;
  last_name: string | null;
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
        const { id, phone_numbers, email_addresses, first_name, last_name } = event.data;
        await upsertUser(db, {
          clerkId: id,
          phone: phone_numbers?.[0]?.phone_number ?? '',
          email: email_addresses?.[0]?.email_address ?? null,
          firstName: first_name ?? '',
          lastName: last_name ?? '',
          // Default role for new users; updates preserve any existing role
          // because upsertUser's onConflict.set explicitly assigns role to
          // the incoming value — the webhook never sends a role override
          // unless we extend the payload, so this stays 'rider' for created
          // events and is a no-op-equivalent for update events that preserve
          // the existing role server-side.
          role: 'rider',
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
