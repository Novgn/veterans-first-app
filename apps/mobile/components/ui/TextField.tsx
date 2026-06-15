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

  const borderClass = error ? 'border-error' : focused ? 'border-primary' : 'border-stone-300';

  return (
    <View>
      {label ? <Text className="text-stone-700 mb-2 text-base font-medium">{label}</Text> : null}
      <View
        className={`flex-row items-center overflow-hidden rounded-xl border-[1.5px] bg-white ${borderClass} ${editable ? '' : 'opacity-60'}`}>
        {leftSlot ? <View className="pl-4">{leftSlot}</View> : null}
        <TextInput
          ref={ref}
          className="min-h-[56px] flex-1 px-4 text-lg text-foreground"
          placeholderTextColor="#A8A29E"
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
        <Text className="mt-2 text-sm text-error">{error}</Text>
      ) : helperText ? (
        <Text className="text-stone-500 mt-2 text-sm">{helperText}</Text>
      ) : null}
    </View>
  );
});
