/**
 * SelectButton — single-select / toggle chip button for booking flows.
 * Supports outline / filled / accent variants, md/lg sizes, icons, and
 * an optional sublabel. Fires light haptic on press; large senior-friendly
 * touch targets (48dp md, 56dp lg).
 *
 * @example
 * <SelectButton label="9:00 AM" selected={time === '09:00'} onPress={() => setTime('09:00')} />
 */

import * as Haptics from 'expo-haptics';
import { forwardRef, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export type SelectButtonVariant = 'outline' | 'filled' | 'accent';
export type SelectButtonSize = 'md' | 'lg';

export type SelectButtonProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  size?: SelectButtonSize;
  variant?: SelectButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  sublabel?: string;
  onPress?: () => void;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
};

const containerClasses = (
  variant: SelectButtonVariant,
  size: SelectButtonSize,
  selected: boolean,
  disabled: boolean,
  fullWidth: boolean
): string => {
  const base = 'flex-row items-center justify-center';
  const sizing =
    size === 'lg' ? 'min-h-touch-lg px-4 py-3 rounded-xl' : 'min-h-touch px-3 py-2 rounded-lg';
  const width = fullWidth ? 'w-full' : 'self-start';
  const opacity = disabled ? 'opacity-40' : 'active:opacity-80';

  let palette: string;
  if (variant === 'outline') {
    palette = selected
      ? 'border-2 border-primary bg-primary-50'
      : 'border-2 border-stone-300 bg-white';
  } else if (variant === 'filled') {
    palette = selected ? 'bg-primary' : 'bg-stone-100';
  } else {
    palette = selected
      ? 'bg-accent border-2 border-accent'
      : 'bg-accent-50 border-2 border-accent-200';
  }

  return `${base} ${sizing} ${width} ${palette} ${opacity}`;
};

const labelClasses = (
  variant: SelectButtonVariant,
  size: SelectButtonSize,
  selected: boolean
): string => {
  const fontSize = size === 'lg' ? 'text-body font-semibold' : 'text-callout font-semibold';

  if (variant === 'outline') {
    return `${fontSize} ${selected ? 'text-primary-800' : 'text-foreground'}`;
  }
  if (variant === 'filled') {
    return `${fontSize} ${selected ? 'text-white' : 'text-foreground'}`;
  }
  return `${fontSize} ${selected ? 'text-white' : 'text-accent-800'}`;
};

const sublabelClasses = (variant: SelectButtonVariant, selected: boolean): string => {
  if (selected && variant === 'filled') {
    return 'text-footnote text-white/80';
  }
  if (selected && variant === 'outline') {
    return 'text-footnote text-primary-700';
  }
  if (selected && variant === 'accent') {
    return 'text-footnote text-white/80';
  }
  return 'text-footnote text-stone-500';
};

export const SelectButton = forwardRef<View, SelectButtonProps>(function SelectButton(
  {
    label,
    selected = false,
    disabled = false,
    size = 'lg',
    variant = 'outline',
    leftIcon,
    rightIcon,
    sublabel,
    onPress,
    fullWidth = false,
    accessibilityHint,
    testID,
  },
  ref
) {
  const handlePress = () => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      ref={ref}
      onPress={disabled ? undefined : handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ selected, disabled }}
      testID={testID}
      className={containerClasses(variant, size, selected, disabled, fullWidth)}>
      {leftIcon ? <View className="mr-1.5">{leftIcon}</View> : null}
      <View className="items-center justify-center">
        <Text className={labelClasses(variant, size, selected)} numberOfLines={1}>
          {label}
        </Text>
        {sublabel ? (
          <Text className={sublabelClasses(variant, selected)} numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {rightIcon ? <View className="ml-1.5">{rightIcon}</View> : null}
    </Pressable>
  );
});
