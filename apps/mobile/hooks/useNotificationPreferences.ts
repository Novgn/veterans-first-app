/**
 * Notification preferences hooks (Story 4.5).
 *
 * One row per user. If no row exists the hook returns the documented
 * defaults so the UI always has something to render.
 */

import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/lib/supabase';

export interface NotificationPreferences {
  push_enabled: boolean;
  sms_enabled: boolean;
  reminders_enabled: boolean;
  driver_updates_enabled: boolean;
  arrival_photos_enabled: boolean;
  marketing_enabled: boolean;
  push_token: string | null;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  push_enabled: true,
  sms_enabled: true,
  reminders_enabled: true,
  driver_updates_enabled: true,
  arrival_photos_enabled: true,
  marketing_enabled: false,
  push_token: null,
};

export const notificationKeys = {
  all: ['notification-preferences'] as const,
  detail: (userId: string) => [...notificationKeys.all, userId] as const,
};

export function useNotificationPreferences() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: notificationKeys.detail(user?.id ?? ''),
    enabled: !!user?.id,
    queryFn: async (): Promise<NotificationPreferences> => {
      if (!user?.id) return DEFAULT_NOTIFICATION_PREFERENCES;

      const { data: me, error: meError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .maybeSingle();
      if (meError) throw meError;
      if (!me) return DEFAULT_NOTIFICATION_PREFERENCES;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select(
          'push_enabled, sms_enabled, reminders_enabled, driver_updates_enabled, arrival_photos_enabled, marketing_enabled, push_token'
        )
        .eq('user_id', me.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_NOTIFICATION_PREFERENCES;
      return data as NotificationPreferences;
    },
  });
}

export type NotificationPreferenceUpdate = Partial<NotificationPreferences>;

export function useUpdateNotificationPreferences() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: NotificationPreferenceUpdate): Promise<NotificationPreferences> => {
      if (!user?.id) throw new Error('Not signed in');

      const { data: me, error: meError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      if (meError || !me) throw new Error('User profile not found');

      const payload = {
        user_id: me.id,
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...update,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select(
          'push_enabled, sms_enabled, reminders_enabled, driver_updates_enabled, arrival_photos_enabled, marketing_enabled, push_token'
        )
        .single();
      if (error) throw error;
      return data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
