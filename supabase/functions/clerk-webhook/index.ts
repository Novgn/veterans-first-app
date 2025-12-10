/**
 * Clerk Webhook Handler for User Synchronization
 *
 * This Edge Function handles Clerk webhook events to sync user data
 * with the Supabase `users` table.
 *
 * Supported events:
 * - user.created: Creates a new user record in Supabase
 * - user.updated: Updates existing user record in Supabase
 * - user.deleted: Soft-deletes user record in Supabase
 *
 * Required environment variables:
 * - CLERK_WEBHOOK_SECRET: Webhook signing secret from Clerk Dashboard
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.15.0";

// Type definitions for Clerk webhook events
interface ClerkUser {
  id: string;
  phone_numbers: Array<{
    phone_number: string;
    id: string;
  }>;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
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

// CORS headers for preflight requests
// Restrict to Clerk's webhook domains for security
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://clerk.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body and headers
    const payload = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    // Validate required Svix headers
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");
      return new Response(JSON.stringify({ error: "Missing webhook signature headers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature using Svix
    const svix = new Webhook(webhookSecret);
    let event: WebhookEvent;

    try {
      event = svix.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Process webhook event
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "user.created": {
        const { id, phone_numbers, email_addresses, first_name, last_name } = event.data;

        const userData = {
          clerk_id: id,
          phone: phone_numbers?.[0]?.phone_number || null,
          email: email_addresses?.[0]?.email_address || null,
          first_name: first_name || "",
          last_name: last_name || "",
          role: "rider" as const, // Default role for new users
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("users").insert(userData);

        if (error) {
          // Check for duplicate key (user already exists)
          if (error.code === "23505") {
            console.log(`User ${id} already exists, skipping creation`);
          } else {
            console.error("Error creating user:", error);
            return new Response(
              JSON.stringify({
                error: "Failed to create user",
                details: error.message,
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        } else {
          console.log(`User ${id} created successfully`);
        }
        break;
      }

      case "user.updated": {
        const { id, phone_numbers, email_addresses, first_name, last_name } = event.data;

        const updateData = {
          phone: phone_numbers?.[0]?.phone_number || null,
          email: email_addresses?.[0]?.email_address || null,
          first_name: first_name || "",
          last_name: last_name || "",
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("users").update(updateData).eq("clerk_id", id);

        if (error) {
          console.error("Error updating user:", error);
          return new Response(
            JSON.stringify({
              error: "Failed to update user",
              details: error.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        console.log(`User ${id} updated successfully`);
        break;
      }

      case "user.deleted": {
        const { id } = event.data;

        // Soft delete: set a deleted_at timestamp instead of removing the record
        // This preserves referential integrity and audit history
        const { error } = await supabase
          .from("users")
          .update({
            updated_at: new Date().toISOString(),
            deleted_at: new Date().toISOString(),
          })
          .eq("clerk_id", id);

        if (error) {
          console.error("Error deleting user:", error);
          return new Response(
            JSON.stringify({
              error: "Failed to delete user",
              details: error.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        console.log(`User ${id} deleted successfully`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ success: true, event_type: event.type }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
