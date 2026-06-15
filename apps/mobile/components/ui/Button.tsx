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
  const base = 'flex-row items-center justify-center rounded-xl';
  const height = size === 'lg' ? 'min-h-[56px]' : 'min-h-[48px]';
  const padding = size === 'lg' ? 'px-6' : 'px-5';
  const width = fullWidth ? 'w-full' : 'self-start';

  if (variant === 'primary') {
    const bg = disabled ? 'bg-primary/40' : 'bg-primary active:bg-primary-700';
    return `${base} ${height} ${padding} ${width} ${bg}`;
  }
  if (variant === 'secondary') {
    const border = disabled ? 'border-primary/40' : 'border-primary active:bg-primary-50';
    return `${base} ${height} ${padding} ${width} border-2 ${border} bg-transparent`;
  }
  return `${base} ${height} ${padding} ${width} bg-transparent`;
};

const labelClasses = (variant: ButtonVariant, size: ButtonSize, disabled: boolean) => {
  const fontSize = size === 'lg' ? 'text-lg' : 'text-base';
  if (variant === 'primary') {
    return `${fontSize} font-semibold text-white`;
  }
  const color = disabled ? 'text-primary/50' : 'text-primary';
  return `${fontSize} font-semibold ${color}`;
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

  const spinnerColor = variant === 'primary' ? '#FFFFFF' : '#1E40AF';

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
          <Text className={labelClasses(variant, size, Boolean(isInactive))}>{label}</Text>
          {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
});
