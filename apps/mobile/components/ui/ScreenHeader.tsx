import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightSlot?: ReactNode;
};

export function ScreenHeader({ title, onBack, showBack = true, rightSlot }: ScreenHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View className="h-14 flex-row items-center justify-between px-2">
      <View className="w-14 items-start">
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="active:bg-stone-200 h-11 w-11 items-center justify-center rounded-full">
            <Ionicons name="chevron-back" size={28} color="#1E40AF" />
          </Pressable>
        ) : null}
      </View>
      <View className="flex-1 items-center">
        {title ? (
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
            accessibilityRole="header">
            {title}
          </Text>
        ) : null}
      </View>
      <View className="w-14 items-end">{rightSlot}</View>
    </View>
  );
}
