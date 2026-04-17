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
      <View className="flex-1 justify-end bg-black/50" testID={testID}>
        <View className="max-h-[80%] rounded-t-3xl bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-bold text-foreground">Add Availability</Text>
          </View>

          <ScrollView className="px-6 py-4">
            <Text className="mb-2 text-sm font-semibold text-gray-600">Day of week</Text>
            <View className="flex-row flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day, index) => {
                const selected = dayOfWeek === index;
                return (
                  <Pressable
                    key={day}
                    onPress={() => setDayOfWeek(index as DayOfWeek)}
                    className={`min-h-[48px] items-center justify-center rounded-full px-4 ${
                      selected ? 'bg-primary' : 'border border-gray-300 bg-white'
                    }`}
                    accessibilityLabel={day}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    testID={`day-${index}`}>
                    <Text className={selected ? 'font-semibold text-white' : 'text-gray-700'}>
                      {day.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mb-2 mt-6 text-sm font-semibold text-gray-600">Start time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {timeOptions.map((t) => {
                  const selected = startTime === t;
                  return (
                    <Pressable
                      key={`start-${t}`}
                      onPress={() => setStartTime(t)}
                      className={`min-h-[48px] items-center justify-center rounded-full px-4 ${
                        selected ? 'bg-primary' : 'border border-gray-300 bg-white'
                      }`}
                      accessibilityLabel={`Start ${fmtTime(t)}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}>
                      <Text className={selected ? 'font-semibold text-white' : 'text-gray-700'}>
                        {fmtTime(t)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="mb-2 mt-6 text-sm font-semibold text-gray-600">End time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {timeOptions.map((t) => {
                  const selected = endTime === t;
                  return (
                    <Pressable
                      key={`end-${t}`}
                      onPress={() => setEndTime(t)}
                      className={`min-h-[48px] items-center justify-center rounded-full px-4 ${
                        selected ? 'bg-primary' : 'border border-gray-300 bg-white'
                      }`}
                      accessibilityLabel={`End ${fmtTime(t)}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}>
                      <Text className={selected ? 'font-semibold text-white' : 'text-gray-700'}>
                        {fmtTime(t)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {!canSubmit ? (
              <Text className="mt-4 text-sm text-red-600">End time must be after start time.</Text>
            ) : null}
          </ScrollView>

          <View className="flex-row gap-3 border-t border-gray-200 px-6 py-4">
            <Pressable
              onPress={onClose}
              className="min-h-[56px] flex-1 items-center justify-center rounded-xl border-2 border-gray-300"
              accessibilityLabel="Cancel"
              accessibilityRole="button">
              <Text className="text-lg font-semibold text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              className={`min-h-[56px] flex-1 items-center justify-center rounded-xl ${
                canSubmit ? 'bg-primary' : 'bg-gray-300'
              }`}
              accessibilityLabel="Save availability"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              testID="save-availability">
              <Text className="text-lg font-semibold text-white">Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
