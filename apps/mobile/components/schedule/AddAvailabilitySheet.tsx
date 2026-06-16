/**
 * AddAvailabilitySheet — dialog for picking day + start/end time (Story 3.7)
 *
 * Uses simple controlled Pressable rows for day selection and 30-min time
 * buckets rather than a heavy native picker (keeps the touch target simple
 * and consistent across iOS/Android).
 */

import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { DAYS_OF_WEEK, type DayOfWeek } from '@/hooks/useDriverAvailability';

function buildTimeOptions(): string[] {
  const opts: string[] = [];
  for (let h = 5; h <= 22; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    }
  }
  return opts;
}

function fmtTime(t: string): string {
  const [hStr, mStr] = t.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export interface AddAvailabilitySheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => void;
  testID?: string;
}

export function AddAvailabilitySheet({
  visible,
  onClose,
  onSubmit,
  testID,
}: AddAvailabilitySheetProps) {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1);
  const [startTime, setStartTime] = useState('08:00:00');
  const [endTime, setEndTime] = useState('17:00:00');

  const timeOptions = useMemo(buildTimeOptions, []);
  const canSubmit = endTime > startTime;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ dayOfWeek, startTime, endTime });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-ink/40" testID={testID}>
        <View className="max-h-[80%] rounded-t-lg bg-card shadow-overlay">
          <View className="border-hairline border-b px-6 py-4">
            <Text className="font-sans-semibold text-title-2 text-foreground">
              Add Availability
            </Text>
          </View>

          <ScrollView className="px-6 py-4">
            <Text className="mb-2 font-sans-semibold text-footnote text-ink-secondary">
              Day of week
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day, index) => {
                const selected = dayOfWeek === index;
                return (
                  <Pressable
                    key={day}
                    onPress={() => setDayOfWeek(index as DayOfWeek)}
                    className={`min-h-touch items-center justify-center rounded-full px-4 ${
                      selected ? 'bg-primary' : 'border-strong border bg-background'
                    }`}
                    accessibilityLabel={day}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    testID={`day-${index}`}>
                    <Text
                      className={`text-callout ${
                        selected ? 'font-sans-semibold text-white' : 'font-sans text-foreground'
                      }`}>
                      {day.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mb-2 mt-6 font-sans-semibold text-footnote text-ink-secondary">
              Start time
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {timeOptions.map((t) => {
                  const selected = startTime === t;
                  return (
                    <Pressable
                      key={`start-${t}`}
                      onPress={() => setStartTime(t)}
                      className={`min-h-touch items-center justify-center rounded-full px-4 ${
                        selected ? 'bg-primary' : 'border-strong border bg-background'
                      }`}
                      accessibilityLabel={`Start ${fmtTime(t)}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}>
                      <Text
                        className={`text-callout ${
                          selected ? 'font-sans-semibold text-white' : 'font-sans text-foreground'
                        }`}>
                        {fmtTime(t)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="mb-2 mt-6 font-sans-semibold text-footnote text-ink-secondary">
              End time
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {timeOptions.map((t) => {
                  const selected = endTime === t;
                  return (
                    <Pressable
                      key={`end-${t}`}
                      onPress={() => setEndTime(t)}
                      className={`min-h-touch items-center justify-center rounded-full px-4 ${
                        selected ? 'bg-primary' : 'border-strong border bg-background'
                      }`}
                      accessibilityLabel={`End ${fmtTime(t)}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}>
                      <Text
                        className={`text-callout ${
                          selected ? 'font-sans-semibold text-white' : 'font-sans text-foreground'
                        }`}>
                        {fmtTime(t)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {!canSubmit ? (
              <Text className="mt-4 font-sans text-footnote text-error">
                End time must be after start time.
              </Text>
            ) : null}
          </ScrollView>

          <View className="border-hairline flex-row gap-3 border-t px-6 py-4">
            <Pressable
              onPress={onClose}
              className="min-h-touch-lg flex-1 items-center justify-center rounded-md border-2 border-primary bg-transparent active:bg-primary-50"
              accessibilityLabel="Cancel"
              accessibilityRole="button">
              <Text className="font-sans-semibold text-headline text-primary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              className={`min-h-touch-lg flex-1 items-center justify-center rounded-md bg-primary ${
                canSubmit ? 'active:bg-primary-700' : 'opacity-45'
              }`}
              accessibilityLabel="Save availability"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              testID="save-availability">
              <Text className="font-sans-semibold text-headline text-white">Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
