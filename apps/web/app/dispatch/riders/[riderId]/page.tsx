/**
 * Rider detail (Story 3.16 follow-on — FR39)
 *
 * Read-only profile a dispatcher can open from the rider database. Surfaces the
 * information needed to serve a rider safely — most importantly mobility /
 * accessibility needs, which are otherwise invisible at dispatch and can lead
 * to a wheelchair rider being assigned an unsuitable vehicle. Also shows the
 * emergency contact (for incidents), comfort preferences, upcoming rides, and
 * ride + no-show history. No mutations here; notes/flags are a follow-on.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDateTime, humanStatus } from '@/lib/format';
import { getServerSupabase } from '@/lib/supabase';
import {
  MOBILITY_AID_LABELS,
  firstRelation,
  requiresAccessibleVehicle,
  type RiderAccessibility,
} from '@/lib/rider-accessibility';

export const dynamic = 'force-dynamic';

const ACTIVE_RIDE_STATUSES = [
  'pending',
  'confirmed',
  'pending_acceptance',
  'assigned',
  'en_route',
  'in_progress',
  'arrived',
];

const COMFORT_TEMPERATURE_LABELS: Record<string, string> = {
  cool: 'Cooler',
  normal: 'Normal',
  warm: 'Warmer',
};
const CONVERSATION_LABELS: Record<string, string> = {
  quiet: 'Prefers quiet',
  some: 'Some conversation',
  chatty: 'Enjoys conversation',
};
const MUSIC_LABELS: Record<string, string> = {
  none: 'No music',
  soft: 'Soft music',
  any: 'Any music',
};

interface RiderPrefs extends RiderAccessibility {
  comfort_temperature?: string | null;
  conversation_preference?: string | null;
  music_preference?: string | null;
  other_notes?: string | null;
}

interface RiderDetail {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  created_at: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  rider_preferences: RiderPrefs | RiderPrefs[] | null;
}

interface RideRow {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_pickup_time: string | null;
  completed_at: string | null;
}

async function fetchRider(riderId: string): Promise<RiderDetail | null> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('users')
      .select(
        `id, first_name, last_name, phone, email, created_at,
         emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
         rider_preferences ( mobility_aid, needs_door_assistance, needs_package_assistance,
           extra_vehicle_space, special_equipment_notes, comfort_temperature,
           conversation_preference, music_preference, other_notes )`,
      )
      .eq('id', riderId)
      .eq('role', 'rider')
      .maybeSingle();
    return (data as unknown as RiderDetail | null) ?? null;
  } catch {
    return null;
  }
}

async function fetchUpcoming(riderId: string): Promise<RideRow[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select('id, status, pickup_address, dropoff_address, scheduled_pickup_time, completed_at')
      .eq('rider_id', riderId)
      .in('status', ACTIVE_RIDE_STATUSES)
      .order('scheduled_pickup_time', { ascending: true })
      .limit(25);
    return (data as RideRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function fetchHistory(riderId: string): Promise<RideRow[]> {
  try {
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from('rides')
      .select('id, status, pickup_address, dropoff_address, scheduled_pickup_time, completed_at')
      .eq('rider_id', riderId)
      .order('scheduled_pickup_time', { ascending: false })
      .limit(25);
    return (data as RideRow[] | null) ?? [];
  } catch {
    return [];
  }
}

async function fetchNoShowCount(riderId: string): Promise<number> {
  try {
    const supabase = await getServerSupabase();
    const { count } = await supabase
      .from('rides')
      .select('id', { count: 'exact', head: true })
      .eq('rider_id', riderId)
      .eq('status', 'no_show');
    return count ?? 0;
  } catch {
    return 0;
  }
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-ink-secondary">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </>
  );
}

function statusBadgeVariant(status: string): 'default' | 'success' | 'error' | 'secondary' {
  if (status === 'completed') return 'success';
  if (status === 'no_show' || status === 'cancelled') return 'error';
  if (status === 'pending' || status === 'pending_acceptance') return 'secondary';
  return 'default';
}

export default async function RiderDetailPage(props: { params: Promise<{ riderId: string }> }) {
  const { riderId } = await props.params;
  const [rider, upcoming, history, noShowCount] = await Promise.all([
    fetchRider(riderId),
    fetchUpcoming(riderId),
    fetchHistory(riderId),
    fetchNoShowCount(riderId),
  ]);

  if (!rider) {
    notFound();
  }

  const prefs = firstRelation<RiderPrefs>(rider.rider_preferences);
  const needsAccessible = requiresAccessibleVehicle(prefs);
  const mobilityLabel = prefs?.mobility_aid ? MOBILITY_AID_LABELS[prefs.mobility_aid] : null;
  const hasEmergencyContact = Boolean(
    rider.emergency_contact_name || rider.emergency_contact_phone,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div>
          <Link
            href="/dispatch/riders"
            className="text-callout font-semibold text-navy hover:underline"
          >
            ← All riders
          </Link>
          <h2 className="mt-1 text-title-2 font-semibold text-ink">
            {rider.last_name}, {rider.first_name}
          </h2>
          <p className="text-body text-ink-secondary">
            {rider.phone ? (
              <a
                href={`tel:${rider.phone}`}
                className="font-semibold text-sage hover:text-sage-700"
              >
                {rider.phone}
              </a>
            ) : (
              'No phone on file'
            )}
            {rider.email ? ` · ${rider.email}` : ''}
          </p>
        </div>
      </div>

      {/* Safety-critical: surface an accessible-vehicle need before anything else. */}
      {needsAccessible ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border-2 border-warning bg-warning-100 p-4"
        >
          <span aria-hidden="true" className="text-title-3">
            ♿
          </span>
          <div>
            <p className="text-body font-semibold text-ink">
              Requires a wheelchair-accessible vehicle
            </p>
            <p className="text-callout text-ink-secondary">
              {mobilityLabel ?? 'Mobility needs'}
              {prefs?.extra_vehicle_space ? ' · needs extra vehicle space' : ''}. Confirm the
              assigned vehicle can accommodate before dispatching.
            </p>
          </div>
        </div>
      ) : null}

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Accessibility &amp; mobility</h3>
        {prefs ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
            <DetailRow label="Mobility aid">{mobilityLabel ?? 'None'}</DetailRow>
            <DetailRow label="Door-to-door assistance">
              {prefs.needs_door_assistance ? 'Yes' : 'No'}
            </DetailRow>
            <DetailRow label="Help with packages">
              {prefs.needs_package_assistance ? 'Yes' : 'No'}
            </DetailRow>
            <DetailRow label="Extra vehicle space">
              {prefs.extra_vehicle_space ? 'Yes' : 'No'}
            </DetailRow>
            <DetailRow label="Special equipment">{prefs.special_equipment_notes || '—'}</DetailRow>
          </dl>
        ) : (
          <p className="text-body text-ink-secondary">No accessibility preferences on file.</p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Emergency contact</h3>
        {hasEmergencyContact ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
            <DetailRow label="Name">{rider.emergency_contact_name || '—'}</DetailRow>
            <DetailRow label="Relationship">
              {rider.emergency_contact_relationship || '—'}
            </DetailRow>
            <DetailRow label="Phone">
              {rider.emergency_contact_phone ? (
                <a
                  href={`tel:${rider.emergency_contact_phone}`}
                  className="font-semibold text-sage hover:text-sage-700"
                >
                  {rider.emergency_contact_phone}
                </a>
              ) : (
                '—'
              )}
            </DetailRow>
          </dl>
        ) : (
          <p className="text-body text-ink-secondary">No emergency contact on file.</p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Comfort preferences</h3>
        {prefs &&
        (prefs.comfort_temperature ||
          prefs.conversation_preference ||
          prefs.music_preference ||
          prefs.other_notes) ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
            <DetailRow label="Temperature">
              {prefs.comfort_temperature
                ? (COMFORT_TEMPERATURE_LABELS[prefs.comfort_temperature] ??
                  prefs.comfort_temperature)
                : '—'}
            </DetailRow>
            <DetailRow label="Conversation">
              {prefs.conversation_preference
                ? (CONVERSATION_LABELS[prefs.conversation_preference] ??
                  prefs.conversation_preference)
                : '—'}
            </DetailRow>
            <DetailRow label="Music">
              {prefs.music_preference
                ? (MUSIC_LABELS[prefs.music_preference] ?? prefs.music_preference)
                : '—'}
            </DetailRow>
            <DetailRow label="Other notes">{prefs.other_notes || '—'}</DetailRow>
          </dl>
        ) : (
          <p className="text-body text-ink-secondary">No comfort preferences on file.</p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-title-3 font-semibold text-ink">Upcoming rides</h3>
        {upcoming.length === 0 ? (
          <p className="text-body text-ink-secondary">No upcoming rides.</p>
        ) : (
          <ul className="space-y-3 text-body">
            {upcoming.map((ride) => (
              <li
                key={ride.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border-hairline pb-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-ink">
                    {ride.pickup_address} → {ride.dropoff_address}
                  </div>
                  <div className="text-caption text-ink-secondary">
                    {formatDateTime(ride.scheduled_pickup_time)}
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(ride.status)}>{humanStatus(ride.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-title-3 font-semibold text-ink">Ride history</h3>
          {noShowCount > 0 ? (
            <Badge variant="error">
              {noShowCount} no-show{noShowCount === 1 ? '' : 's'}
            </Badge>
          ) : null}
        </div>
        {history.length === 0 ? (
          <p className="text-body text-ink-secondary">No rides yet.</p>
        ) : (
          <ul className="space-y-3 text-body">
            {history.map((ride) => (
              <li
                key={ride.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border-hairline pb-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-ink">
                    {ride.pickup_address} → {ride.dropoff_address}
                  </div>
                  <div className="text-caption text-ink-secondary">
                    {formatDateTime(ride.scheduled_pickup_time)}
                  </div>
                </div>
                <Badge variant={statusBadgeVariant(ride.status)}>{humanStatus(ride.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
