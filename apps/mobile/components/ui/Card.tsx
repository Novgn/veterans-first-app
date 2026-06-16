/**
 * Card — Versatile rounded container primitive.
 *
 * Variants: `elevated` (white + shadow-sm), `outlined` (white + stone border),
 * `flat` (stone-100 fill). Padding presets align to the app's spacing scale.
 *
 * Usage:
 *   <Card variant="outlined" padding="lg"><Text>Details</Text></Card>
 */

import type { ReactNode } from 'react';
import { View } from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardProps = {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  /** Optional testID forwarded to the root element. */
  testID?: string;
  children: ReactNode;
};

// Veteran Honor card: white surface on the stone canvas, 16px (rounded-lg)
// corners, soft shadow-card, and a 1px hairline boundary (dividers/decoration).
const VARIANT_CLASS: Record<CardVariant, string> = {
  elevated: 'bg-card rounded-lg border border-hairline shadow-card',
  outlined: 'bg-card rounded-lg border border-hairline',
  flat: 'bg-background rounded-lg',
};

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'elevated',
  padding = 'md',
  className,
  testID,
  children,
}: CardProps) {
  const classes = [VARIANT_CLASS[variant], PADDING_CLASS[padding], className]
    .filter(Boolean)
    .join(' ');

  return (
    <View className={classes} testID={testID}>
      {children}
    </View>
  );
}
