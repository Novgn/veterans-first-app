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
        .select('id, phone')
        .eq('clerk_id', user.id)
        .single();

      if (userError || !userData) return [];

      // PostgREST FK embed: `users!<column_name>` embeds through the FK
      // column, regardless of the constraint's generated name.
      const joinColumn = role === 'rider' ? 'family_member_id' : 'rider_id';
      const selectClause = `
        id, rider_id, family_member_id, invited_phone, relationship,
        permissions, status, created_at, updated_at,
        counterpart:users!${joinColumn}(
          id, first_name, last_name, phone, profile_photo_url
        )
      `;

      if (role === 'rider') {
        const { data, error } = await supabase
          .from('family_links')
          .select(selectClause)
          .eq('rider_id', userData.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data ?? []) as unknown as FamilyLinkView[];
      }

      // Family role: include rows pointing at user id AND rows invited via
      // the user's phone (pre-claim). Approval will write family_member_id.
      const byIdPromise = supabase
        .from('family_links')
        .select(selectClause)
        .eq('family_member_id', userData.id);
      const byPhonePromise = userData.phone
        ? supabase
            .from('family_links')
            .select(selectClause)
            .is('family_member_id', null)
            .eq('invited_phone', userData.phone)
        : Promise.resolve({ data: [] as unknown[], error: null });

      const [byId, byPhone] = await Promise.all([byIdPromise, byPhonePromise]);
      if (byId.error) throw byId.error;
      if ('error' in byPhone && byPhone.error) throw byPhone.error;

      const rows = [
        ...((byId.data ?? []) as unknown as FamilyLinkView[]),
        ...((byPhone.data ?? []) as unknown as FamilyLinkView[]),
      ];
      // Dedupe by id in case of overlap.
      const seen = new Set<string>();
      return rows.filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      });
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
        .select('id, phone')
        .eq('clerk_id', user.id)
        .single();
      if (riderError || !rider) throw new Error('Rider profile not found');

      if (rider.phone === phone) {
        throw new Error("You can't invite your own phone number");
      }

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
 * `approved` and also claims the link for the signed-in user (sets
 * `family_member_id` + clears `invited_phone` so the link stops matching
 * by phone). `decline` hard-deletes the row — lets the rider re-invite
 * without hitting the `(rider_id, family_member_id)` unique constraint.
 */
export function useRespondToFamilyInvite() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, action }: RespondToInviteInput): Promise<void> => {
      if (action === 'decline') {
        const { error } = await supabase.from('family_links').delete().eq('id', linkId);
        if (error) throw error;
        return;
      }

      if (!user?.id) throw new Error('Not signed in');
      const { data: me, error: meError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      if (meError || !me) throw new Error('User profile not found');

      const { error } = await supabase
        .from('family_links')
        .update({
          status: 'approved',
          family_member_id: me.id,
          invited_phone: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', linkId);
      if (error) throw error;
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
 * Rider-side revoke. Hard-deletes the row — riders need to be able to
 * re-invite without hitting the `(rider_id, family_member_id)` unique
 * constraint. Story 4.2 wraps this call with an undo window via
 * `useFamilyRevocationQueue`. Audit log entries for deleted rows are
 * written by the DB trigger (Story 1.5), so history survives.
 */
export function useRevokeFamilyLink() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId }: RevokeLinkInput): Promise<void> => {
      const { error } = await supabase.from('family_links').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
    },
  });
}
