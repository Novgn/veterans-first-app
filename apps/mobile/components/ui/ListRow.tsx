/**
 * ListRow — One tappable row inside a SectionGroup (or standalone).
 *
 * Provides the iOS-style grouped row: leading slot (optionally tinted),
 * title/subtitle, trailing slot (auto chevron when pressable), and full
 * accessibility. Min touch target 56dp for older-rider ergonomics.
 *
 * Usage:
 *   <ListRow
 *     leading={<Ionicons name="person" size={22} color="#1E40AF" />}
 *     leadingTint="primary"
 *     title="Profile"
 *     subtitle="Name, photo, preferences"
 *     onPress={() => router.push('/profile')}
 *   />
 */

import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export type ListRowTint = 'primary' | 'secondary' | 'accent' | 'stone' | 'error' | 'success';

export type ListRowProps = {
  leading?: ReactNode;
  leadingTint?: ListRowTint;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  accessibilityHint?: string;
  testID?: string;
};

const TINT_BG_CLASS: Record<ListRowTint, string> = {
  primary: 'bg-primary-100',
  secondary: 'bg-secondary-100',
  accent: 'bg-accent-100',
  stone: 'bg-stone-100',
  error: 'bg-red-100',
  success: 'bg-secondary-100',
};

function LeadingSlot({ leading, leadingTint }: { leading: ReactNode; leadingTint?: ListRowTint }) {
  if (leadingTint) {
    return (
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${TINT_BG_CLASS[leadingTint]}`}>
        {leading}
      </View>
    );
  }
  return <View className="h-10 w-10 items-center justify-center">{leading}</View>;
}

export function ListRow({
  leading,
  leadingTint,
  title,
  subtitle,
  trailing,
  onPress,
  disabled,
  destructive,
  accessibilityHint,
  testID,
}: ListRowProps) {
  const isPressable = Boolean(onPress) && !disabled;
  const titleColor = destructive ? 'text-error' : 'text-foreground';
  const titleClass = `text-body font-medium ${titleColor}`;
  const containerBase = `min-h-touch-lg flex-row items-center px-4 py-3 ${disabled ? 'opacity-50' : ''}`;
  const pressClass = isPressable ? 'active:bg-stone-100' : '';

  // Auto-chevron when pressable and trailing was not provided at all.
  // `null` is a valid explicit opt-out; `undefined` means "use default".
  const resolvedTrailing =
    trailing === undefined && isPressable ? (
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    ) : trailing === null ? null : (
      trailing
    );

  const content = (
    <>
      {leading !== undefined ? (
        <View className="mr-3">
          <LeadingSlot leading={leading} leadingTint={leadingTint} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className={titleClass}>{title}</Text>
        {subtitle ? <Text className="text-stone-500 mt-0.5 text-footnote">{subtitle}</Text> : null}
      </View>
      {resolvedTrailing ? <View className="ml-3">{resolvedTrailing}</View> : null}
    </>
  );

  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: Boolean(disabled) }}
        testID={testID}
        className={`${containerBase} ${pressClass}`}>
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      testID={testID}
      className={containerBase}>
      {content}
    </View>
  );
}
