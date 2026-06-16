/**
 * BottomActionBar — Safe-area-aware sticky footer for primary action(s).
 *
 * Renders on the app background with a top divider (by default) and bottom
 * padding that respects the safe-area inset (min 12pt). Caller is free to
 * wrap in KeyboardAvoidingView when the bar needs to track the keyboard.
 *
 * Usage:
 *   <BottomActionBar>
 *     <Button label="Confirm booking" onPress={handleConfirm} />
 *   </BottomActionBar>
 */

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomActionBarProps = {
  children: ReactNode;
  divider?: boolean;
  className?: string;
};

export function BottomActionBar({ children, divider = true, className }: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 12);

  const base = 'bg-background px-6 pt-3';
  const dividerClass = divider ? 'border-t border-stone-200' : '';
  const classes = [base, dividerClass, className].filter(Boolean).join(' ');

  return (
    <View className={classes} style={{ paddingBottom }}>
      {children}
    </View>
  );
}
