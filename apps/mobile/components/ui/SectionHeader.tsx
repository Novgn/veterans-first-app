/**
 * SectionHeader — Uppercase muted label shown above a SectionGroup.
 *
 * Matches the iOS "grouped inset list" pattern. Optional `hint` is shown as a
 * secondary footnote line beneath the title.
 *
 * Usage:
 *   <SectionHeader title="Account" hint="Manage your profile and settings" />
 */

import { Text, View } from 'react-native';

export type SectionHeaderProps = {
  title: string;
  hint?: string;
};

export function SectionHeader({ title, hint }: SectionHeaderProps) {
  return (
    <View className="mb-2 px-1">
      <Text className="text-stone-500 text-footnote font-semibold uppercase tracking-wide">
        {title}
      </Text>
      {hint ? <Text className="text-stone-500 text-footnote">{hint}</Text> : null}
    </View>
  );
}
