/**
 * Thin client for posting ride/driver notifications back to the web
 * app's /api/notifications endpoints (Stories 4.6–4.10).
 *
 * Uses the signed-in user's Clerk token so the API route can
 * authenticate the caller via the standard getCurrentUserId() helper.
 * All calls are fire-and-forget — if the network fails we swallow the
 * error so primary mutations (status transitions, etc.) don't break.
 */

/** Matches the shape of the object returned from Clerk's `useSession()`. */
export interface SessionLike {
  getToken: (opts?: { template?: string }) => Promise<string | null>;
}

const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_API_URL ?? '';

export type RideNotificationType =
  | 'driver_assigned'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'ride_accepted'
  | 'ride_declined'
  | 'offer_expired';

export type DriverNotificationType =
  | 'driver_ride_assigned'
  | 'driver_ride_cancelled'
  | 'driver_ride_updated';

async function postJson(path: string, body: unknown, session: SessionLike | null | undefined) {
  if (!WEB_BASE_URL) {
    // No web API configured (e.g., local dev without EXPO_PUBLIC_WEB_API_URL);
    // silently no-op so callers aren't affected.
    return;
  }
  try {
    const token = session ? await session.getToken({ template: 'supabase' }) : null;
    await fetch(`${WEB_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Fire-and-forget.
  }
}

export function notifyRideEvent(
  session: SessionLike | null | undefined,
  payload: {
    type: RideNotificationType;
    rideId: string;
    driverId?: string;
    etaMinutes?: number;
  }
): Promise<void> {
  return postJson('/api/notifications/ride', payload, session);
}

export function notifyDriverEvent(
  session: SessionLike | null | undefined,
  payload: {
    type: DriverNotificationType;
    rideId: string;
    driverId: string;
  }
): Promise<void> {
  return postJson('/api/notifications/driver', payload, session);
}
