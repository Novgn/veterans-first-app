/**
 * Notification Preferences screen (Story 4.5).
 *
 * Toggles save on change. Optimistic update pattern via react-query
 * cache updates so the switch reflects the new value immediately.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ActivityIndicator, SafeAreaView, ScrollView, Switch, Text, View } from 'react-native';

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type NotificationPreferences,
  type NotificationPreferenceUpdate,
} from '@/hooks/useNotificationPreferences';

interface PrefRowProps {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  testID: string;
}

function PrefRow({ label, hint, value, onChange, testID }: PrefRowProps) {
  return (
    <View className="border-hairline min-h-[56px] flex-row items-center justify-between border-b px-4 py-4">
      <View className="mr-4 flex-1">
        <Text className="font-sans-medium text-body text-foreground">{label}</Text>
        {hint ? (
          <Text className="mt-0.5 font-sans text-caption text-ink-secondary">{hint}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: '#1F3A5F', false: '#DAD3C6' }}
        thumbColor="#ffffff"
        accessibilityLabel={label}
        testID={testID}
      />
    </View>
  );
}

export default function NotificationPreferencesScreen() {
  const { data: prefs = DEFAULT_NOTIFICATION_PREFERENCES, isLoading } =
    useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  const set = (patch: NotificationPreferenceUpdate) => {
    update.mutate({ ...prefs, ...patch } satisfies NotificationPreferences);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ActivityIndicator size="large" color="#1F3A5F" className="mt-12" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScrollView className="flex-1 px-6 pt-4" testID="notification-preferences-screen">
        <View className="border-hairline mb-6 flex-row items-center rounded-lg border bg-card p-4 shadow-card">
          <Ionicons name="notifications" size={24} color="#1F3A5F" />
          <Text className="ml-3 flex-1 font-sans text-footnote text-ink-secondary">
            Choose how and what we notify you about. Your preferences apply across all
            notifications, including those sent to linked family members.
          </Text>
        </View>

        <Text className="mb-2 font-sans-semibold text-footnote uppercase text-ink-secondary">
          Channels
        </Text>
        <View className="border-hairline mb-6 overflow-hidden rounded-lg border bg-card shadow-card">
          <PrefRow
            label="Push notifications"
            hint="Alerts on your phone lock screen"
            value={prefs.push_enabled}
            onChange={(next) => set({ push_enabled: next })}
            testID="pref-push"
          />
          <PrefRow
            label="SMS text messages"
            hint="Backup channel when push is unavailable"
            value={prefs.sms_enabled}
            onChange={(next) => set({ sms_enabled: next })}
            testID="pref-sms"
          />
        </View>

        <Text className="mb-2 font-sans-semibold text-footnote uppercase text-ink-secondary">
          What to send
        </Text>
        <View className="border-hairline mb-6 overflow-hidden rounded-lg border bg-card shadow-card">
          <PrefRow
            label="Ride reminders"
            hint="24 hours and 1 hour before each ride"
            value={prefs.reminders_enabled}
            onChange={(next) => set({ reminders_enabled: next })}
            testID="pref-reminders"
          />
          <PrefRow
            label="Driver status updates"
            hint="Assigned, en route, arrived"
            value={prefs.driver_updates_enabled}
            onChange={(next) => set({ driver_updates_enabled: next })}
            testID="pref-driver-updates"
          />
          <PrefRow
            label="Arrival photos"
            hint="Photo confirmations sent to family"
            value={prefs.arrival_photos_enabled}
            onChange={(next) => set({ arrival_photos_enabled: next })}
            testID="pref-arrival-photos"
          />
          <PrefRow
            label="Marketing"
            hint="Product updates and tips"
            value={prefs.marketing_enabled}
            onChange={(next) => set({ marketing_enabled: next })}
            testID="pref-marketing"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
