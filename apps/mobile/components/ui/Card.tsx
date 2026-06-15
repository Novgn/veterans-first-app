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
  children: ReactNode;
};

const VARIANT_CLASS: Record<CardVariant, string> = {
  elevated: 'bg-white rounded-2xl shadow-sm',
  outlined: 'bg-white rounded-2xl border border-stone-200',
  flat: 'bg-stone-100 rounded-2xl',
};

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ variant = 'elevated', padding = 'md', className, children }: CardProps) {
  const classes = [VARIANT_CLASS[variant], PADDING_CLASS[padding], className]
    .filter(Boolean)
    .join(' ');

  return <View className={classes}>{children}</View>;
}
