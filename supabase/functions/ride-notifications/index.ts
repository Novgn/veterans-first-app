/**
 * Ride Notifications Edge Function
 *
 * Handles sending push notifications for ride-related events.
 * Can be triggered by database webhooks or direct API calls.
 *
 * Supported notification types:
 * - ride_accepted: Driver accepted a ride - notify rider
 * - ride_declined: Driver declined a ride (internal use)
 * - offer_expired: Ride offer expired without response
 *
 * TODO: Implement push notification service integration (e.g., Expo Push, FCM)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface NotificationRequest {
  type: "ride_accepted" | "ride_declined" | "offer_expired";
  rideId: string;
  driverId?: string;
  riderId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { type, rideId, driverId, riderId }: NotificationRequest = await req.json();

    console.log(`Processing notification: ${type} for ride ${rideId}`);

    switch (type) {
      case "ride_accepted": {
        // Get ride and driver details
        const { data: ride, error: rideError } = await supabase
          .from("rides")
          .select(
            `
            id,
            scheduled_pickup_time,
            rider:users!rider_id (id, phone, first_name),
            driver:users!driver_id (id, first_name, last_name)
          `
          )
          .eq("id", rideId)
          .single();

        if (rideError || !ride) {
          console.error("Error fetching ride:", rideError);
          return new Response(JSON.stringify({ error: "Ride not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // TODO: Send push notification to rider
        // Example message: "[Driver Name] accepted your ride for [time]"
        console.log(`TODO: Send push notification to rider ${ride.rider?.id}`);
        console.log(`Message: ${ride.driver?.first_name} accepted your ride`);

        break;
      }

      case "ride_declined": {
        // Internal logging only - no notification to rider
        console.log(`Ride ${rideId} declined by driver ${driverId}`);
        break;
      }

      case "offer_expired": {
        // Update offer status to expired
        const { error: updateError } = await supabase
          .from("ride_offers")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("ride_id", rideId)
          .eq("status", "pending");

        if (updateError) {
          console.error("Error updating expired offer:", updateError);
        }

        // Return ride to dispatch pool
        await supabase
          .from("rides")
          .update({
            status: "confirmed",
            driver_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", rideId);

        console.log(`Ride ${rideId} offer expired, returned to dispatch pool`);
        break;
      }

      default:
        console.log(`Unknown notification type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true, type }), {
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
