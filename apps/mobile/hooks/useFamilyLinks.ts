/**
 * TanStack Query hooks for family link management (Story 4.1, 4.2).
 *
 * Riders invite family members by phone number. Family members respond to
 * invitations via the family route group. Both sides share the same
 * family_links table; RLS decides who sees what row.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

export type FamilyLinkStatus = 'pending' | 'approved' | 'revoked';

export interface FamilyLinkPermissions {
  view_rides: boolean;
  book_rides: boolean;
  receive_notifications: boolean;
}

export interface FamilyLinkRow {
  id: string;
  rider_id: string;
  family_member_id: string | null;
  invited_phone: string | null;
  relationship: string | null;
  permissions: FamilyLinkPermissions;
  status: FamilyLinkStatus;
  created_at: string;
  updated_at: string;
}

export interface FamilyLinkPerson {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_photo_url: string | null;
}

export interface FamilyLinkView extends FamilyLinkRow {
  // Populated from the opposite side of the relationship.
  counterpart: FamilyLinkPerson | null;
}

export const familyLinkKeys = {
  all: ['family-links'] as const,
  rider: (riderId: string) => [...familyLinkKeys.all, 'rider', riderId] as const,
  family: (familyId: string) => [...familyLinkKeys.all, 'family', familyId] as const,
};

export const DEFAULT_FAMILY_PERMISSIONS: FamilyLinkPermissions = {
  view_rides: true,
  book_rides: false,
  receive_notifications: true,
};

/**
 * Normalize a user-entered phone to E.164 (naive: keeps leading `+`,
 * strips everything else). Mirrors the rule in project_context.md.
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  if (trimmed.startsWith('+')) return `+${digitsOnly}`;
  // US default: 10-digit numbers get +1 prefix.
  if (digitsOnly.length === 10) return `+1${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return `+${digitsOnly}`;
  return `+${digitsOnly}`;
}

/**
 * Hook that fetches family links visible to the current user, shaped to
 * whichever side of the relationship the caller cares about.
 *
 * - `role: 'rider'`  → links owned by the rider (pending + approved).
 * - `role: 'family'` → links where the current user is the family member.
 */
export function useFamilyLinks(role: 'rider' | 'family') {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey:
      role === 'rider'
        ? familyLinkKeys.rider(user?.id ?? '')
        : familyLinkKeys.family(user?.id ?? ''),
    queryFn: async (): Promise<FamilyLinkView[]> => {
      if (!user?.id) return [];

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (userError || !userData) return [];

      const column = role === 'rider' ? 'rider_id' : 'family_member_id';
      const joinColumn = role === 'rider' ? 'family_member_id' : 'rider_id';

      const { data, error } = await supabase
        .from('family_links')
        .select(
          `
          id, rider_id, family_member_id, invited_phone, relationship,
          permissions, status, created_at, updated_at,
          counterpart:users!family_links_${joinColumn === 'rider_id' ? 'rider_id_users_id_fk' : 'family_member_id_users_id_fk'}(
            id, first_name, last_name, phone, profile_photo_url
          )
        `
        )
        .eq(column, userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data ?? []) as unknown as FamilyLinkView[]).filter(
        (row) => row.status !== 'revoked'
      );
    },
    enabled: !!user?.id,
  });
}

export interface InviteFamilyInput {
  phone: string;
  relationship: string | null;
  permissions?: Partial<FamilyLinkPermissions>;
}

/**
 * Invite a family member by phone. If a user already exists for that
 * phone, the link is created pointing at their user id. Otherwise the
 * phone is stored on `invited_phone` and will be claimed once the
 * invitee signs up (claim logic lives in the Clerk user webhook).
 */
export function useInviteFamilyMember() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InviteFamilyInput): Promise<FamilyLinkRow> => {
      if (!user?.id) throw new Error('Not signed in');

      const phone = normalizePhone(input.phone);
      if (!phone || phone.length < 5) {
        throw new Error('Please enter a valid phone number');
      }

      const { data: rider, error: riderError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      if (riderError || !rider) throw new Error('Rider profile not found');

      // Look up the family member by phone (may not exist yet).
      const { data: existing, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();
      if (existingError) throw existingError;

      const permissions: FamilyLinkPermissions = {
        ...DEFAULT_FAMILY_PERMISSIONS,
        ...(input.permissions ?? {}),
      };

      const payload = {
        rider_id: rider.id,
        family_member_id: existing?.id ?? null,
        invited_phone: existing ? null : phone,
        relationship: input.relationship,
        permissions,
        status: 'pending' as const,
      };

      const { data, error } = await supabase
        .from('family_links')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      return data as FamilyLinkRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
    },
  });
}

export interface RespondToInviteInput {
  linkId: string;
  action: 'approve' | 'decline';
}

/**
 * Approve or decline a pending invitation. `approve` flips status to
 * `approved`; `decline` hard-deletes the row (so the rider can re-invite
 * without bumping against the `(rider_id, family_member_id)` unique
 * constraint).
 */
export function useRespondToFamilyInvite() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, action }: RespondToInviteInput): Promise<void> => {
      if (action === 'approve') {
        const { error } = await supabase
          .from('family_links')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', linkId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('family_links').delete().eq('id', linkId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
    },
  });
}

export interface RevokeLinkInput {
  linkId: string;
}

/**
 * Rider-side revoke. Deletes the row so the rider can re-invite if they
 * change their mind. (Story 4.2 extends this with an undo window.)
 */
export function useRevokeFamilyLink() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId }: RevokeLinkInput): Promise<void> => {
      const { error } = await supabase
        .from('family_links')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
    },
  });
}
