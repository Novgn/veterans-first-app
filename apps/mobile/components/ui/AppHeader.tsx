/**
 * AppHeader — unified app header for Veterans 1st mobile app.
 *
 * Replaces both `components/Header.tsx` (tab screens) and the legacy
 * `components/ui/ScreenHeader.tsx` (sub-screens) with a single component that
 * supports two modes: `brand` (wordmark + right slot) and `screen`
 * (back button + centered title + right slot).
 *
 * Usage:
 *   // Brand / tab screen header
 *   <AppHeader mode="brand" />
 *
 *   // Sub-screen header with centered title
 *   <AppHeader mode="screen" title="Saved Places" />
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PhoneButton } from '@/components/PhoneButton';

export type AppHeaderMode = 'brand' | 'screen';

export type AppHeaderProps = {
  /** Header style. `brand` shows the wordmark; `screen` shows back + title. Defaults to `screen`. */
  mode?: AppHeaderMode;
  /** Title shown in `screen` mode. Ignored in `brand` mode. */
  title?: string;
  /** Optional small line rendered beneath the title in `screen` mode. */
  subtitle?: string;
  /** Whether to render the back button in `screen` mode. Ignored in `brand` mode. Defaults to true. */
  showBack?: boolean;
  /** Custom back handler. Defaults to `router.back()` from expo-router. */
  onBack?: () => void;
  /** Optional right-slot content. `brand` mode falls back to `<PhoneButton />`. */
  rightSlot?: ReactNode;
  /** testID forwarded to the root container. */
  testID?: string;
};

const PRIMARY_COLOR = '#1E40AF';

/**
 * Migration note: `AppHeader` replaces both `components/Header.tsx` and
 * `components/ui/ScreenHeader.tsx`. Phase 2 will migrate all consumers; the
 * legacy components remain in place until that migration completes.
 */
export function AppHeader({
  mode = 'screen',
  title,
  subtitle,
  showBack = true,
  onBack,
  rightSlot,
  testID,
}: AppHeaderProps) {
  if (mode === 'brand') {
    return (
      <View
        accessibilityRole="header"
        testID={testID}
        className="h-14 flex-row items-center justify-between bg-background px-4">
        <View className="min-w-[44px] flex-row items-center">
          <Text
            accessibilityRole="header"
            accessibilityLabel="Veterans 1st"
            className="text-lg font-bold text-primary">
            Veterans 1st
          </Text>
        </View>
        <View className="min-w-[44px] items-end justify-center">
          {rightSlot ?? <PhoneButton />}
        </View>
      </View>
    );
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      accessibilityRole="header"
      testID={testID}
      className="h-14 flex-row items-center justify-between bg-background px-4">
      <View className="h-11 w-11 items-start justify-center">
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen"
            className="active:bg-stone-200 h-11 w-11 items-center justify-center rounded-full">
            <Ionicons name="chevron-back" size={28} color={PRIMARY_COLOR} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-1 items-center justify-center px-2">
        {title ? (
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            className="text-base font-semibold text-foreground">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={1} className="text-stone-500 text-sm">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View className="h-11 w-11 items-end justify-center">{rightSlot ?? null}</View>
    </View>
  );
}
