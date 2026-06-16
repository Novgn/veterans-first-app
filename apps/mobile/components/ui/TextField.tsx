import { forwardRef, useState, type ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helperText, leftSlot, rightSlot, onFocus, onBlur, editable = true, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);

  // border-strong is the ONLY valid control boundary; error stays in error red,
  // focus lifts to navy. Hairline is never used as a control edge.
  const borderClass = error ? 'border-error' : focused ? 'border-primary' : 'border-strong';

  return (
    <View>
      {/* Label is ALWAYS visible — never placeholder-only. */}
      {label ? (
        <Text className="mb-2 font-sans-semibold text-footnote text-foreground">{label}</Text>
      ) : null}
      <View
        className={`min-h-touch-lg flex-row items-center overflow-hidden rounded-sm border bg-card ${borderClass} ${editable ? '' : 'opacity-45'}`}>
        {leftSlot ? <View className="pl-4">{leftSlot}</View> : null}
        <TextInput
          ref={ref}
          className="min-h-touch-lg flex-1 px-4 font-sans text-body text-foreground"
          placeholderTextColor="#4F4A41"
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightSlot ? <View className="pr-4">{rightSlot}</View> : null}
      </View>
      {error ? (
        <Text className="mt-2 font-sans text-footnote text-error">{error}</Text>
      ) : helperText ? (
        <Text className="mt-2 font-sans text-footnote text-ink-secondary">{helperText}</Text>
      ) : null}
    </View>
  );
});
