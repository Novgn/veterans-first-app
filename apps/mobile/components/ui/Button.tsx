import * as Haptics from 'expo-haptics';
import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const containerClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  disabled: boolean
) => {
  // rounded-md (12px) is the Veteran Honor default control radius.
  const base = 'flex-row items-center justify-center rounded-md';
  // Primary CTA = 56dp (h-touch-lg); supporting size = 48dp min (h-touch).
  const height = size === 'lg' ? 'min-h-touch-lg' : 'min-h-touch';
  const padding = size === 'lg' ? 'px-6' : 'px-5';
  const width = fullWidth ? 'w-full' : 'self-start';
  // Disabled controls drop to 45% opacity rather than recoloring.
  const dim = disabled ? 'opacity-45' : '';

  if (variant === 'primary') {
    // Filled navy with white text; press deepens to navy-700.
    const bg = disabled ? 'bg-primary' : 'bg-primary active:bg-primary-700';
    return `${base} ${height} ${padding} ${width} ${bg} ${dim}`;
  }
  if (variant === 'secondary') {
    // Outlined navy on a transparent fill.
    const press = disabled ? '' : 'active:bg-primary-50';
    return `${base} ${height} ${padding} ${width} border-2 border-primary bg-transparent ${press} ${dim}`;
  }
  // Tertiary / ghost — text only, no border or fill.
  return `${base} ${height} ${padding} ${width} bg-transparent ${dim}`;
};

const labelClasses = (variant: ButtonVariant, size: ButtonSize) => {
  const fontSize = size === 'lg' ? 'text-headline' : 'text-callout';
  if (variant === 'primary') {
    return `${fontSize} font-sans-semibold text-white`;
  }
  // Secondary + ghost label render in navy.
  return `${fontSize} font-sans-semibold text-primary`;
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    label,
    variant = 'primary',
    size = 'lg',
    loading = false,
    disabled,
    fullWidth = true,
    leftIcon,
    rightIcon,
    onPress,
    accessibilityLabel,
    ...rest
  },
  ref
) {
  const isInactive = disabled || loading;

  const handlePress: PressableProps['onPress'] = (event) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  // Navy (#1F3A5F) for non-primary spinners; white on the filled navy primary.
  const spinnerColor = variant === 'primary' ? '#FFFFFF' : '#1F3A5F';

  return (
    <Pressable
      ref={ref}
      onPress={isInactive ? undefined : handlePress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      className={containerClasses(variant, size, fullWidth, Boolean(isInactive))}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <Text className={labelClasses(variant, size)}>{label}</Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
});
