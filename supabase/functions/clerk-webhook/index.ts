// Supabase Edge Function: Clerk webhook handler.
//
// Runs on Deno Deploy. Handles Clerk user lifecycle events by upserting
// rows in the `users` table via the service-role key (bypasses RLS).
// Svix signatures are verified with the Web Crypto API — no npm deps.
//
// Configure the webhook in the Clerk dashboard:
//   URL:    https://<project-ref>.supabase.co/functions/v1/clerk-webhook
//   Events: user.created, user.updated, user.deleted
//   Copy the signing secret into CLERK_WEBHOOK_SECRET below.
//
// Required function-level secrets (set via `supabase secrets set`):
//   CLERK_WEBHOOK_SECRET      Svix signing secret from Clerk dashboard
//   SUPABASE_URL              Auto-injected by Supabase — do NOT set manually
//   SUPABASE_SERVICE_ROLE_KEY Auto-injected by Supabase — do NOT set manually
//
// Deploy:   supabase functions deploy clerk-webhook --no-verify-jwt
// (no-verify-jwt is critical: Clerk calls this endpoint without a Supabase
// JWT; our own Svix signature check is the security boundary.)

import { createClient } from "jsr:@supabase/supabase-js@^2";

interface ClerkUser {
  id: string;
  phone_numbers: { phone_number: string; id: string }[];
  email_addresses: { email_address: string; id: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url?: string;
}

interface WebhookEvent {
  type: string;
  data: ClerkUser;
  object: string;
}

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const bytesToBase64 = (bytes: ArrayBuffer): string => {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.byteLength; i += 1) binary += String.fromCharCode(arr[i] ?? 0);
  return btoa(binary);
};

async function verifySvixSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignatureHeader: string,
  rawBody: string
): Promise<boolean> {
  // Svix secrets are prefixed with `whsec_` followed by base64-encoded key.
  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ""));

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const toSign = new TextEncoder().encode(`${svixId}.${svixTimestamp}.${rawBody}`);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, toSign);
  const expected = bytesToBase64(signatureBuffer);

  // Header format: "v1,<sig1> v1,<sig2>". Accept if any sig matches expected.
  return svixSignatureHeader
    .split(" ")
    .map((pair) => pair.split(",")[1])
    .filter(Boolean)
    .some((sig) => sig === expected);
}

function assertFreshTimestamp(svixTimestamp: string): void {
  const ts = Number(svixTimestamp);
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  if (Math.abs(now - ts) > fiveMinutes) {
    throw new Error("Webhook timestamp outside tolerance window");
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("clerk-webhook: missing server env vars");
    return Response.json({ error: "Server not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing webhook signature headers" }, { status: 400 });
  }

  const rawBody = await req.text();

  try {
    assertFreshTimestamp(svixTimestamp);
    const ok = await verifySvixSignature(
      webhookSecret,
      svixId,
      svixTimestamp,
      svixSignature,
      rawBody
    );
    if (!ok) {
      return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
  } catch (err) {
    console.error("clerk-webhook: signature verification failed", err);
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, phone_numbers, email_addresses, first_name, last_name } = event.data;
        const phone = phone_numbers?.[0]?.phone_number ?? "";
        const email = email_addresses?.[0]?.email_address ?? null;
        const firstName = first_name ?? "";
        const lastName = last_name ?? "";

        if (event.type === "user.created") {
          const { error } = await supabase.from("users").insert({
            clerk_id: id,
            phone,
            email,
            first_name: firstName,
            last_name: lastName,
            role: "rider",
          });
          // Idempotent: another concurrent request may have already created
          // the row. Ignore unique-violation.
          if (error && error.code !== "23505") {
            console.error("clerk-webhook: insert failed", error);
            return Response.json({ error: "Insert failed" }, { status: 500 });
          }
        } else {
          const { error } = await supabase
            .from("users")
            .update({
              phone,
              email,
              first_name: firstName,
              last_name: lastName,
              updated_at: new Date().toISOString(),
              // Intentionally omit `role` — role changes go through admin tooling,
              // not Clerk lifecycle webhooks.
            })
            .eq("clerk_id", id);
          if (error) {
            console.error("clerk-webhook: update failed", error);
            return Response.json({ error: "Update failed" }, { status: 500 });
          }
        }
        return Response.json({ success: true, event_type: event.type });
      }

      case "user.deleted": {
        const { error } = await supabase
          .from("users")
          .update({ deleted_at: new Date().toISOString() })
          .eq("clerk_id", event.data.id);
        if (error) {
          console.error("clerk-webhook: soft-delete failed", error);
          return Response.json({ error: "Delete failed" }, { status: 500 });
        }
        return Response.json({ success: true, event_type: event.type });
      }

      default:
        console.warn("clerk-webhook: unhandled event type", event.type);
        return Response.json({ success: true, event_type: event.type, handled: false });
    }
  } catch (err) {
    console.error("clerk-webhook: processing failed", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
});
