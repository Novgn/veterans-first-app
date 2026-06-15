import { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';

import { TextField, type TextFieldProps } from './TextField';

export type PhoneFieldProps = Omit<TextFieldProps, 'leftSlot' | 'keyboardType' | 'autoComplete'> & {
  countryCode?: string;
  flagEmoji?: string;
};

const formatUSPhone = (raw: string) => {
  let digits = raw.replace(/\D/g, '');
  // Strip leading US country code (`1`) if user pasted a +1-prefixed number.
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const PhoneField = forwardRef<TextInput, PhoneFieldProps>(function PhoneField(
  { countryCode = '+1', flagEmoji = '🇺🇸', value, onChangeText, ...rest },
  ref
) {
  const handleChange = (text: string) => {
    onChangeText?.(formatUSPhone(text));
  };

  return (
    <TextField
      ref={ref}
      value={value}
      onChangeText={handleChange}
      keyboardType="phone-pad"
      autoComplete="tel"
      placeholder="(555) 123-4567"
      leftSlot={
        <View className="mr-2 flex-row items-center gap-1">
          <Text className="text-xl">{flagEmoji}</Text>
          <Text className="text-stone-700 text-lg font-medium">{countryCode}</Text>
        </View>
      }
      {...rest}
    />
  );
});

export const toE164 = (formatted: string, countryCode = '+1') => {
  let digits = formatted.replace(/\D/g, '');
  // Guard against a leading US country code sneaking in — the formatter
  // should have stripped it, but belt-and-suspenders before we hit Clerk.
  if (countryCode === '+1' && digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return `${countryCode}${digits}`;
};
