// Driver-facing notifications endpoint (Story 4.8).
//
// Thin HTTP wrapper over notifyDriverRideEvent — the shared implementation the
// dispatch console server actions call directly. Notifies a driver that a ride
// was assigned, cancelled, or updated.

import { NextResponse } from 'next/server';

import { getCurrentUserId } from '@/lib/auth/roles';
import { notifyDriverRideEvent, type DriverRideEventType } from '@/lib/notifications/notifyDriver';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DriverNotificationRequest {
  type: DriverRideEventType;
  rideId: string;
  driverId: string;
  reason?: string;
  changedFields?: string[];
}

export async function POST(req: Request) {
  const caller = await getCurrentUserId();
  if (!caller) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: DriverNotificationRequest;
  try {
    body = (await req.json()) as DriverNotificationRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, rideId, driverId, reason, changedFields } = body;
  if (!type || !rideId || !driverId) {
    return NextResponse.json({ error: 'type, rideId, driverId are required' }, { status: 400 });
  }

  const dispatched = await notifyDriverRideEvent({ type, rideId, driverId, reason, changedFields });
  if (!dispatched) {
    return NextResponse.json({ error: 'Ride or driver not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, type, rideId });
}
